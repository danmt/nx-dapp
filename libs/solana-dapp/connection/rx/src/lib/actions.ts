import { Network } from '@nx-dapp/solana-dapp/connection/types';
import { AccountInfo, Connection } from '@solana/web3.js';

export class InitAction {
  type = 'init';
}

export class SelectNetworkAction {
  type = 'selectNetwork';

  constructor(public payload: string) {}
}

export class LoadNetworkAction {
  type = 'loadNetwork';

  constructor(public payload: Network) {}
}

export class LoadNetworksAction {
  type = 'loadNetworks';

  constructor(public payload: Network[]) {}
}

export class LoadConnectionAction {
  type = 'loadConnection';

  constructor(public payload: Connection) {}
}

export class LoadSendConnectionAction {
  type = 'loadSendConnection';

  constructor(public payload: Connection) {}
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
