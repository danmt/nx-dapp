import { Network } from '@nx-dapp/solana-dapp/connection/types';
import { Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  InitAction,
  LoadConnectionAction,
  LoadNetworkAction,
  LoadNetworksAction,
  SelectNetworkAction,
} from './actions';

export type Action =
  | InitAction
  | SelectNetworkAction
  | LoadConnectionAction
  | LoadNetworkAction
  | LoadNetworksAction;

export interface ConnectionState {
  selectedNetwork: string | null;
  networks: Network[];
  network: Network | null;
  slippage: number;
  connection: Connection | null;
}

export interface IConnectionService {
  actions$: Observable<Action>;
  state$: Observable<ConnectionState>;
  networks$: Observable<Network[]>;
  network$: Observable<Network | null>;
  connection$: Observable<Connection | null>;

  loadNetworks(networks: Network[]): void;

  selectNetwork(networkId: string): void;
}
