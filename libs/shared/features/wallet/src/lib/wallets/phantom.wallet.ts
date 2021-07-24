import EventEmitter from 'eventemitter3';
import { PublicKey, Transaction } from '@solana/web3.js';

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
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<any>;
  listeners: (event: PhantomEvent) => (() => void)[];
}

export class PhantomWallet extends EventEmitter {
  // _provider: PhantomProvider;

  constructor() {
    super();
    this.connect = this.connect.bind(this);
    // this._provider = (window as any).solana;
  }

  private get _provider(): PhantomProvider | undefined {
    if ((window as any)?.solana?.isPhantom) {
      return (window as any).solana;
    }
    return undefined;
  }

  private _handleConnect = (...args: any) => {
    this.emit('connect', ...args);
  };

  private _handleDisconnect = (...args: any) => {
    this.emit('disconnect', ...args);
  };

  get connected() {
    return this._provider?.isConnected;
  }

  get autoApprove() {
    return this._provider?.autoApprove;
  }

  // eslint-disable-next-line
  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    if (!this._provider) {
      return transactions;
    }

    return this._provider.signAllTransactions(transactions);
  }

  get publicKey() {
    return this._provider?.publicKey;
  }

  // eslint-disable-next-line
  async signTransaction(transaction: Transaction) {
    return this._provider?.signTransaction(transaction);
  }

  connect() {
    if (!this._provider) {
      throw new Error('Phantom not available');
    }
    if (!this._provider.listeners('connect').length) {
      this._provider.on('connect', this._handleConnect);
    }
    if (!this._provider.listeners('disconnect').length) {
      this._provider.on('disconnect', this._handleDisconnect);
    }
    return this._provider.connect();
  }

  disconnect() {
    if (!this._provider) {
      throw new Error('Phantom not available');
    }
    return this._provider.disconnect();
  }
}
