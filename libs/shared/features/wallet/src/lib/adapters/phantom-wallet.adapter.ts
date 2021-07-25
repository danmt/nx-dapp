import { PublicKey, Transaction } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';

import { Wallet } from '../interfaces';

type PhantomEvent = 'disconnect' | 'connect';
type PhantomRequestMethod =
  | 'connect'
  | 'disconnect'
  | 'signTransaction'
  | 'signAllTransactions';

interface PhantomProvider {
  publicKey: PublicKey;
  isConnected: boolean;
  autoApprove: boolean;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: unknown) => void) => void;
  request: (method: PhantomRequestMethod, params: unknown) => Promise<unknown>;
  listeners: (event: PhantomEvent) => (() => void)[];
}

export class PhantomWalletAdapter extends EventEmitter implements Wallet {
  constructor() {
    super();
  }

  private get _provider(): PhantomProvider {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const phantom = (window as any)?.solana;

    if (!phantom?.isPhantom) {
      throw new Error('Phantom not available');
    }

    return phantom;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _handleConnect = (...args: any) => {
    this.emit('connect', ...args);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _handleDisconnect = (...args: any) => {
    this.emit('disconnect', ...args);
  };

  get connected() {
    return this._provider?.isConnected;
  }

  get autoApprove() {
    return this._provider?.autoApprove;
  }

  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    return this._provider.signAllTransactions(transactions);
  }

  get publicKey() {
    return this._provider.publicKey;
  }

  async signTransaction(transaction: Transaction) {
    return this._provider.signTransaction(transaction);
  }

  connect() {
    if (!this._provider.listeners('connect').length) {
      this._provider.on('connect', this._handleConnect);
    }
    if (!this._provider.listeners('disconnect').length) {
      this._provider.on('disconnect', this._handleDisconnect);
    }
    return this._provider.connect();
  }

  disconnect() {
    return this._provider.disconnect();
  }
}
