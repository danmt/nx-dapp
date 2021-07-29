import {
  LoadConnectionAction,
  LoadTokenAccountsAction,
  LoadWalletConnectedAction,
  LoadWalletPublicKeyAction,
} from './actions';
import { AccountState, Action } from './types';

export const accountInitialState: AccountState = {
  userAccounts: [],
  tokenAccounts: [],
  nativeAccount: null,
  connection: null,
  walletPublicKey: null,
  walletConnected: false,
};

export const reducer = (state: AccountState, action: Action) => {
  switch (action.type) {
    case 'loadConnection':
      return {
        ...state,
        connection: (action as LoadConnectionAction).payload,
      };
    case 'loadWalletPublicKey':
      return {
        ...state,
        walletPublicKey: (action as LoadWalletPublicKeyAction).payload,
      };
    case 'loadWalletConnected':
      return {
        ...state,
        walletConnected: (action as LoadWalletConnectedAction).payload,
      };
    case 'loadTokenAccounts':
      return {
        ...state,
        tokenAccounts: (action as LoadTokenAccountsAction).payload,
      };
    default:
      return state;
  }
};
