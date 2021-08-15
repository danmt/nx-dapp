import {
  TransactionPayload,
  WalletAdapter,
  WalletAdapterEvents,
  WalletAdapterNetwork,
} from '@nx-dapp/solana-dapp/utils/types';
import Wallet from '@project-serum/sol-wallet-adapter';
import { PublicKey, Transaction as Web3Transaction } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';

import {
  WalletConnectionError,
  WalletNotConnectedError,
  WalletSignatureError,
  WalletWindowBlockedError,
  WalletWindowClosedError,
} from '../utils';

export interface SolletWalletAdapterConfig {
  provider?: string | { postMessage: (...args: unknown[]) => unknown };
  network?: WalletAdapterNetwork;
}

export class SolletWalletAdapter
  extends EventEmitter<WalletAdapterEvents>
  implements WalletAdapter
{
  private _connecting: boolean;
  private _wallet: Wallet | null;
  private _provider: string | { postMessage: (...args: unknown[]) => unknown };
  private _network: WalletAdapterNetwork;

  constructor(config?: SolletWalletAdapterConfig) {
    super();
    this._connecting = false;
    this._wallet = null;
    this._provider = config?.provider || 'https://www.sollet.io';
    this._network = config?.network || WalletAdapterNetwork.Mainnet;
  }

  get publicKey(): PublicKey | null {
    return this._wallet?.publicKey || null;
  }

  get ready(): boolean {
    // @FIXME
    return true;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return !!this._wallet?.connected;
  }

  get autoApprove(): boolean {
    return !!this._wallet?.autoApprove;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      this._connecting = true;

      const wallet = await getWallet(this._provider, this._network);
      let interval: NodeJS.Timer | undefined;

      try {
        // HACK: sol-wallet-adapter doesn't reject or emit an event if the popup is closed or blocked
        await new Promise<void>((resolve, reject) => {
          wallet.connect().then(resolve, reject);

          if (typeof this._provider === 'string') {
            let count = 0;

            interval = setInterval(() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const popup = (wallet as any)._popup;
              if (popup) {
                if (popup.closed) reject(new WalletWindowClosedError());
              } else {
                if (count > 50) reject(new WalletWindowBlockedError());
              }

              count++;
            }, 100);
          }
        });
      } finally {
        if (interval) clearInterval(interval);
      }

      this._wallet = wallet;
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
    const wallet = this._wallet;
    if (wallet) {
      this._wallet = null;

      try {
        await wallet.disconnect();
      } catch (error) {
        if (error instanceof Error) {
          this.emit('error', error);
        }
      }

      this.emit('disconnect');
    }
  }

  async signTransaction(
    transaction: TransactionPayload
  ): Promise<Web3Transaction> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        return await wallet.signTransaction(transaction.data);
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
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        return wallet.signAllTransactions(transactions);
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

const getWallet = async (
  provider: string | { postMessage: (...args: unknown[]) => unknown },
  network: WalletAdapterNetwork
): Promise<Wallet> => {
  try {
    return new Wallet(provider, network);
  } catch (error) {
    if (error instanceof Error) {
      throw new WalletConnectionError(error.message, error);
    } else {
      throw error;
    }
  }
};
