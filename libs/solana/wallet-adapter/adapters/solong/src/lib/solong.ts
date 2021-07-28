import { PublicKey, Transaction } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';

import {
  pollUntilReady,
  WalletAdapter,
  WalletAdapterEvents,
  WalletAccountError,
  WalletNotConnectedError,
  WalletNotFoundError,
  WalletPublicKeyError,
  WalletSignatureError,
} from '@nx-dapp/solana/wallet-adapter/base';

interface SolongProvider {
  currentAccount?: string | null;
  selectAccount: () => Promise<string>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
}

interface SolongWindow extends Window {
  solong?: SolongProvider;
}

declare const window: SolongWindow;

export interface SolongWalletAdapterConfig {
  pollInterval?: number;
  pollCount?: number;
}

export class SolongWalletAdapter
  extends EventEmitter<WalletAdapterEvents>
  implements WalletAdapter
{
  private _publicKey: PublicKey | null;
  private _connecting: boolean;
  private _provider: SolongProvider | undefined;

  constructor(config: SolongWalletAdapterConfig = {}) {
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
    return !!window.solong;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return !!this._provider?.currentAccount;
  }

  get autoApprove(): boolean {
    return false;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      this._connecting = true;

      const provider = window.solong;
      if (!provider) throw new WalletNotFoundError();

      let account = '';
      try {
        account = await provider.selectAccount();
      } catch (error) {
        if (error instanceof Error) {
          throw new WalletAccountError(error.message, error);
        } else {
          throw error;
        }
      }

      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(account);
      } catch (error) {
        throw new WalletPublicKeyError((error as Error)?.message, error);
      }

      this._publicKey = publicKey;
      this._provider = provider;
      this.emit('connect');
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this._provider) {
      this._publicKey = null;
      this._provider = undefined;
      this.emit('disconnect');
    }
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      const provider = this._provider;
      if (!provider) throw new WalletNotConnectedError();

      try {
        return await provider.signTransaction(transaction);
      } catch (error) {
        throw new WalletSignatureError((error as Error)?.message, error);
      }
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    try {
      const provider = this._provider;
      if (!provider) throw new WalletNotConnectedError();

      try {
        return await Promise.all(
          transactions.map((transaction) =>
            provider.signTransaction(transaction)
          )
        );
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
