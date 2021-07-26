import { PublicKey, PublicKeyInitData, Transaction } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';

type SolongEvent = 'disconnect' | 'connect';

interface SolongProvider {
  publicKey: PublicKey;
  isConnected: boolean;
  autoApprove: boolean;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  on: (event: SolongEvent, handler: (args: unknown) => void) => void;
  listeners: (event: SolongEvent) => (() => void)[];
  selectAccount: () => Promise<PublicKeyInitData>;
}

export class SolongWalletAdapter extends EventEmitter {
  _publicKey: PublicKey | null = null;
  _onProcess = false;

  constructor() {
    super();
  }

  private get _provider(): SolongProvider {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const solong = (window as any)?.solong;

    if (!solong) {
      throw new Error('Solong not available');
    }

    return solong;
  }

  get publicKey() {
    return this._publicKey;
  }

  async signTransaction(transaction: Transaction) {
    return this._provider.signTransaction(transaction);
  }

  connect() {
    this._onProcess = true;

    return this._provider
      .selectAccount()
      .then((account: PublicKeyInitData) => {
        this._publicKey = new PublicKey(account);
        this.emit('connect', this._publicKey);
      })
      .catch(() => {
        this.disconnect();
      })
      .finally(() => {
        this._onProcess = false;
      });
  }

  disconnect() {
    if (this._publicKey) {
      this._publicKey = null;
      this.emit('disconnect');
    }

    return Promise.resolve();
  }
}
