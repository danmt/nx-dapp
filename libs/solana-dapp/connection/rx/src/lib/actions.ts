import { AccountInfo } from '@solana/web3.js';

export class InitAction {
  type = 'init';
}

export class SelectEndpointAction {
  type = 'selectEndpoint';

  constructor(public payload: string) {}
}

export class ConnectionAccountChangedAction {
  type = 'connectionAccountChanged';

  constructor(public payload: AccountInfo<Buffer>) {}
}

export class ConnectionSlotChangedAction {
  type = 'connectionSlotChanged';
}

export class SendConnectionAccountChangedAction {
  type = 'sendConnectionAccountChanged';
}

export class SendConnectionSlotChangedAction {
  type = 'sendConnectionSlotChanged';
}
