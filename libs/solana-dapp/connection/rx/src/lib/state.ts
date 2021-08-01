import { DEFAULT_SLIPPAGE } from '@nx-dapp/solana-dapp/connection/base';
import { TokenInfo } from '@solana/spl-token-registry';

import {
  ConnectionAccountChangedAction,
  LoadConnectionAction,
  LoadEndpointAction,
  LoadSendConnectionAction,
  LoadTokensAction,
  SelectEndpointAction,
} from './actions';
import { Action, ConnectionState } from './types';

export const connectionInitialState: ConnectionState = {
  selectedEndpoint: null,
  slippage: DEFAULT_SLIPPAGE,
  endpoints: [],
  endpoint: null,
  connection: null,
  connectionAccount: null,
  sendConnection: null,
  tokens: new Map<string, TokenInfo>(),
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
    case 'loadTokens':
      return {
        ...state,
        tokens: [...(action as LoadTokensAction).payload.values()].reduce(
          (tokens, account) => tokens.set(account.address, account),
          new Map(state.tokens)
        ),
      };
    default:
      return state;
  }
};
