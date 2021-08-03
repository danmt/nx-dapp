import {
  ConnectionAccountChangedAction,
  LoadConnectionAction,
  LoadNetworkAction,
  LoadNetworksAction,
  LoadSendConnectionAction,
  SelectNetworkAction,
} from './actions';
import { DEFAULT_SLIPPAGE } from './consts';
import { Action, ConnectionState } from './types';

export const connectionInitialState: ConnectionState = {
  selectedNetwork: null,
  slippage: DEFAULT_SLIPPAGE,
  networks: [],
  network: null,
  connection: null,
  connectionAccount: null,
  sendConnection: null,
};

export const reducer = (state: ConnectionState, action: Action) => {
  switch (action.type) {
    case 'selectNetwork':
      return {
        ...state,
        selectedNetwork: (action as SelectNetworkAction).payload,
      };
    case 'loadNetwork':
      return {
        ...state,
        network: (action as LoadNetworkAction).payload,
      };
    case 'loadNetworks':
      return {
        ...state,
        networks: (action as LoadNetworksAction).payload,
      };
    case 'loadConnection':
      return {
        ...state,
        connection: (action as LoadConnectionAction).payload,
      };
    case 'loadSendConnection':
      return {
        ...state,
        sendConnection: (action as LoadSendConnectionAction).payload,
      };
    case 'connectionAccountChanged':
      return {
        ...state,
        connectionAccount: (action as ConnectionAccountChangedAction).payload,
      };
    default:
      return state;
  }
};
