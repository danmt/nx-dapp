import { Transaction } from '@nx-dapp/solana-dapp/transaction';
import { PublicKey, Transaction as Web3Transaction } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';

import { WalletAdapter, WalletAdapterEvents } from '../types';
import {
  pollUntilReady,
  WalletAccountError,
  WalletConnectionError,
  WalletError,
  WalletNotConnectedError,
  WalletNotFoundError,
  WalletNotInstalledError,
  WalletPublicKeyError,
  WalletSignatureError,
  WalletWindowClosedError,
} from '../utils';

export interface PhantomProviderEvents {
  connect: (...args: unknown[]) => unknown;
  disconnect: (...args: unknown[]) => unknown;
}

interface PhantomProvider extends EventEmitter<PhantomProviderEvents> {
  isPhantom?: boolean;
  // Due to weird Phantom bug where their public key isn't quite like ours
  publicKey?: { toBuffer(): Buffer };
  isConnected: boolean;
  autoApprove: boolean;
  signTransaction: (transaction: Web3Transaction) => Promise<Web3Transaction>;
  signAllTransactions: (
    transactions: Web3Transaction[]
  ) => Promise<Web3Transaction[]>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  _handleDisconnect: (...args: unknown[]) => unknown;
}

interface PhantomWindow extends Window {
  solana?: PhantomProvider;
}

declare const window: PhantomWindow;

export interface PhantomWalletAdapterConfig {
  pollInterval?: number;
  pollCount?: number;
}

export class PhantomWalletAdapter
  extends EventEmitter<WalletAdapterEvents>
  implements WalletAdapter
{
  private _publicKey: PublicKey | null;
  private _connecting: boolean;
  private _provider: PhantomProvider | undefined;

  constructor(config: PhantomWalletAdapterConfig = {}) {
    super();
    this._publicKey = null;
    this._connecting = false;

    if (!this.ready)
      pollUntilReady(this, config.pollInterval || 1000, config.pollCount || 3);
  }

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get ready(): boolean {
    return !!window.solana?.isPhantom;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return !!this._provider?.isConnected;
  }

  get autoApprove(): boolean {
    return !!this._provider?.autoApprove;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      this._connecting = true;

      const provider = window.solana;
      if (!provider) throw new WalletNotFoundError();
      if (!provider.isPhantom) throw new WalletNotInstalledError();

      if (!provider.isConnected) {
        // HACK: Phantom doesn't reject or emit an event if the popup is closed
        const disconnect = provider._handleDisconnect;
        try {
          await new Promise<void>((resolve, reject) => {
            const connect = () => {
              provider.off('connect', connect);
              resolve();
            };

            provider._handleDisconnect = (...args: unknown[]) => {
              provider.off('connect', connect);
              reject(new WalletWindowClosedError());
              return disconnect.apply(provider, args);
            };

            provider.on('connect', connect);

            provider.connect().catch((reason: unknown) => {
              provider.off('connect', connect);
              reject(reason);
            });
          });
        } catch (error) {
          if (error instanceof WalletError) {
            throw error;
          } else if (error instanceof Error) {
            throw new WalletConnectionError(error.message, error);
          }
        } finally {
          provider._handleDisconnect = disconnect;
        }
      }

      const buffer = getBuffer(provider);

      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(buffer);
      } catch (error) {
        if (error instanceof Error) {
          throw new WalletPublicKeyError(error.message, error);
        } else {
          throw error;
        }
      }

      provider.once('disconnect', () => this.disconnect());

      this._publicKey = publicKey;
      this._provider = provider;
      this.emit('connect');
    } catch (error) {
      if (error instanceof Error) {
        this.emit('error', error);
      }
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const provider = this._provider;
    if (provider) {
      this._publicKey = null;
      this._provider = undefined;

      try {
        await provider.disconnect();
      } catch (error) {
        if (error instanceof Error) {
          this.emit('error', error);
        }
      }

      this.emit('disconnect');
    }
  }

  async signTransaction(transaction: Transaction): Promise<Web3Transaction> {
    try {
      const provider = this._provider;
      if (!provider) throw new WalletNotConnectedError();

      try {
        return provider.signTransaction(transaction.data);
      } catch (error) {
        throw new WalletSignatureError(error.message, error, transaction.id);
      }
    } catch (error) {
      if (error instanceof Error) {
        this.emit('error', error);
      }
      throw error;
    }
  }

  async signAllTransactions(
    transactions: Web3Transaction[]
  ): Promise<Web3Transaction[]> {
    try {
      const provider = this._provider;
      if (!provider) throw new WalletNotConnectedError();

      try {
        return provider.signAllTransactions(transactions);
      } catch (error) {
        if (error instanceof Error) {
          throw new WalletSignatureError(error.message, error);
        } else {
          throw error;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        this.emit('error', error);
      }
      throw error;
    }
  }
}

export const getBuffer = (provider: PhantomProvider) => {
  try {
    if (!provider.publicKey) {
      throw new Error('asd');
    }
    return provider.publicKey.toBuffer();
  } catch (error) {
    if (error instanceof Error) {
      throw new WalletAccountError(error.message, error);
    } else {
      throw error;
    }
  }
};
