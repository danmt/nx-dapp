import { Endpoint, ENV } from '@nx-dapp/solana/connection-adapter/base';
import { AccountInfo, Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';

import { InitAction, SelectEndpointAction } from './actions';

export type Action = InitAction | SelectEndpointAction;

export interface ConnectionState {
  endpoint: string;
  endpoints: Endpoint[];
  slippage: number;
  connection: Connection;
  sendConnection: Connection;
}

export interface IConnectionService {
  actions$: Observable<Action>;
  state$: Observable<ConnectionState>;
  endpoints$: Observable<Endpoint[]>;
  endpoint$: Observable<string>;
  chain$: Observable<Endpoint>;
  env$: Observable<ENV>;
  connection$: Observable<Connection>;
  sendConnection$: Observable<Connection>;
  onConnectionAccountChange$: Observable<AccountInfo<Buffer>>; // TODO: use proper type
  onConnectionSlotChange$: Observable<unknown>; // TODO: use proper type
  onSendConnectionAccountChange$: Observable<unknown>; // TODO: use proper type
  onSendConnectionSlotChange$: Observable<unknown>; // TODO: use proper type

  setEndpoint(endpointId: string): void;
}
