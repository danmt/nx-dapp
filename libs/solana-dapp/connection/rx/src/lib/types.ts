import { Endpoint, ENV } from '@nx-dapp/solana-dapp/connection/base';
import { TokenInfo } from '@solana/spl-token-registry';
import { AccountInfo, Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  ConnectionAccountChangedAction,
  ConnectionSlotChangedAction,
  InitAction,
  LoadTokensAction,
  SelectEndpointAction,
  SendConnectionAccountChangedAction,
  SendConnectionSlotChangedAction,
  LoadConnectionAction,
  LoadEndpointAction,
  LoadEndpointsAction,
  LoadSendConnectionAction,
} from './actions';

export type Action =
  | InitAction
  | SelectEndpointAction
  | ConnectionAccountChangedAction
  | ConnectionSlotChangedAction
  | SendConnectionAccountChangedAction
  | SendConnectionSlotChangedAction
  | LoadTokensAction
  | LoadConnectionAction
  | LoadEndpointAction
  | LoadEndpointsAction
  | LoadSendConnectionAction;

export interface ConnectionState {
  selectedEndpoint: string | null;
  endpoint: Endpoint | null;
  endpoints: Endpoint[];
  slippage: number;
  connection: Connection | null;
  connectionAccount: AccountInfo<Buffer> | null;
  sendConnection: Connection | null;
  tokens: Map<string, TokenInfo>;
}

export interface IConnectionService {
  actions$: Observable<Action>;
  state$: Observable<ConnectionState>;
  endpoints$: Observable<Endpoint[]>;
  selectedEndpoint$: Observable<string | null>;
  endpoint$: Observable<Endpoint | null>;
  env$: Observable<ENV | null>;
  connection$: Observable<Connection | null>;
  connectionAccount$: Observable<AccountInfo<Buffer> | null>;
  sendConnection$: Observable<Connection | null>;

  loadEndpoints(endpoints: Endpoint[]): void;

  selectEndpoint(endpointId: string): void;
}
