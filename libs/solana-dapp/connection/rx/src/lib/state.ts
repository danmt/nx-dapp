import {
  DEFAULT_ENDPOINT,
  DEFAULT_SLIPPAGE,
  ENDPOINTS,
} from '@nx-dapp/solana-dapp/connection/base';
import { Connection } from '@solana/web3.js';

import {
  ConnectionAccountChangedAction,
  LoadConnectionAction,
  LoadEndpointAction,
  LoadSendConnectionAction,
  SelectEndpointAction,
} from './actions';
import { Action, ConnectionState } from './types';

export const connectionInitialState: ConnectionState = {
  selectedEndpoint: DEFAULT_ENDPOINT,
  slippage: DEFAULT_SLIPPAGE,
  endpoints: ENDPOINTS,
  endpoint: null,
  connection: new Connection(DEFAULT_ENDPOINT, 'recent'),
  connectionAccount: null,
  sendConnection: new Connection(DEFAULT_ENDPOINT, 'recent'),
};

export const reducer = (state: ConnectionState, action: Action) => {
  switch (action.type) {
    case 'selectEndpoint':
      return {
        ...state,
        selectedEndpoint: (action as SelectEndpointAction).payload,
      };
    case 'loadEndpoint':
      return {
        ...state,
        endpoint: (action as LoadEndpointAction).payload,
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
