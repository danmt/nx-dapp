import { Network, ENV } from '@nx-dapp/solana-dapp/connection/base';
import { TokenInfo } from '@solana/spl-token-registry';
import { AccountInfo, Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  ConnectionAccountChangedAction,
  ConnectionSlotChangedAction,
  InitAction,
  SelectNetworkAction,
  SendConnectionAccountChangedAction,
  SendConnectionSlotChangedAction,
  LoadConnectionAction,
  LoadNetworkAction,
  LoadNetworksAction,
  LoadSendConnectionAction,
} from './actions';

export type Action =
  | InitAction
  | SelectNetworkAction
  | ConnectionAccountChangedAction
  | ConnectionSlotChangedAction
  | SendConnectionAccountChangedAction
  | SendConnectionSlotChangedAction
  | LoadConnectionAction
  | LoadNetworkAction
  | LoadNetworksAction
  | LoadSendConnectionAction;

export interface ConnectionState {
  selectedNetwork: string | null;
  networks: Network[];
  network: Network | null;
  slippage: number;
  connection: Connection | null;
  connectionAccount: AccountInfo<Buffer> | null;
  sendConnection: Connection | null;
}

export interface IConnectionService {
  actions$: Observable<Action>;
  state$: Observable<ConnectionState>;
  networks$: Observable<Network[]>;
  selectedNetwork$: Observable<string | null>;
  network$: Observable<Network | null>;
  env$: Observable<ENV | null>;
  connection$: Observable<Connection | null>;
  connectionAccount$: Observable<AccountInfo<Buffer> | null>;
  sendConnection$: Observable<Connection | null>;

  loadNetworks(networks: Network[]): void;

  selectNetwork(networkId: string): void;
}
