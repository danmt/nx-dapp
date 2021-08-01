import { Endpoint, ENV } from '@nx-dapp/solana-dapp/connection/base';
import { AccountInfo, Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  ConnectionAccountChangedAction,
  ConnectionSlotChangedAction,
  InitAction,
  SelectEndpointAction,
  SendConnectionAccountChangedAction,
  SendConnectionSlotChangedAction,
} from './actions';

export type Action =
  | InitAction
  | SelectEndpointAction
  | ConnectionAccountChangedAction
  | ConnectionSlotChangedAction
  | SendConnectionAccountChangedAction
  | SendConnectionSlotChangedAction;

export interface ConnectionState {
  selectedEndpoint: string;
  endpoint: Endpoint | null;
  endpoints: Endpoint[];
  slippage: number;
  connection: Connection;
  connectionAccount: AccountInfo<Buffer> | null;
  sendConnection: Connection;
}

export interface IConnectionService {
  actions$: Observable<Action>;
  state$: Observable<ConnectionState>;
  endpoints$: Observable<Endpoint[]>;
  selectedEndpoint$: Observable<string>;
  endpoint$: Observable<Endpoint | null>;
  env$: Observable<ENV | null>;
  connection$: Observable<Connection>;
  connectionAccount$: Observable<AccountInfo<Buffer> | null>;
  sendConnection$: Observable<Connection>;

  selectEndpoint(endpointId: string): void;
}
