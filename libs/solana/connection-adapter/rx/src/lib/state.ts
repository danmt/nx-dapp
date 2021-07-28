import {
  DEFAULT_ENDPOINT,
  DEFAULT_SLIPPAGE,
  Endpoint,
  ENDPOINTS,
  ENV,
} from '@nx-dapp/solana/connection-adapter/base';
import { Connection } from '@solana/web3.js';
import { Action, SelectEndpointAction } from './actions';

export interface ConnectionState {
  endpoint: string;
  endpoints: Endpoint[];
  slippage: number;
  connection: Connection;
  sendConnection: Connection;
}

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
