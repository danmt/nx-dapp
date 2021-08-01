import { Endpoint } from '@nx-dapp/solana-dapp/connection/base';
import { TokenInfo } from '@solana/spl-token-registry';
import { AccountInfo, Connection } from '@solana/web3.js';

export class InitAction {
  type = 'init';
}

export class SelectEndpointAction {
  type = 'selectEndpoint';

  constructor(public payload: string) {}
}

export class LoadEndpointAction {
  type = 'loadEndpoint';

  constructor(public payload: Endpoint) {}
}

export class LoadEndpointsAction {
  type = 'loadEndpoints';

  constructor(public payload: Endpoint[]) {}
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

export class LoadTokensAction {
  type = 'loadTokens';

  constructor(public payload: Map<string, TokenInfo>) {}
}
