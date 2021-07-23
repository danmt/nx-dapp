import EventEmitter from 'eventemitter3';

export interface Wallet extends EventEmitter {
  connect: () => Promise<void>;
}
