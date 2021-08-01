import {
  DEFAULT_ENDPOINT,
  DEFAULT_SLIPPAGE,
  ENDPOINTS,
} from '@nx-dapp/solana-dapp/connection/base';
import { Connection } from '@solana/web3.js';

import { SelectEndpointAction } from './actions';
import { Action, ConnectionState } from './types';

export const connectionInitialState: ConnectionState = {
  endpoint: DEFAULT_ENDPOINT,
  slippage: DEFAULT_SLIPPAGE,
  endpoints: ENDPOINTS,
  connection: new Connection(DEFAULT_ENDPOINT, 'recent'),
  sendConnection: new Connection(DEFAULT_ENDPOINT, 'recent'),
};

export const reducer = (state: ConnectionState, action: Action) => {
  switch (action.type) {
    case 'selectEndpoint':
      const endpointId = (action as SelectEndpointAction).payload;
      const { endpoint } =
        state.endpoints.find(({ name }) => name === endpointId) ||
        state.endpoints[0];

      return {
        ...state,
        endpoint: endpoint,
        connection: new Connection(endpoint, 'recent'),
        sendConnection: new Connection(endpoint, 'recent'),
      };
    default:
      return state;
  }
};
