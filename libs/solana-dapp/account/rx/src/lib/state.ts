import {
  AccountChangedAction,
  LoadMintAccountsAction,
  LoadMintTokensAction,
  LoadNativeAccountAction,
  LoadTokenAccountsAction,
} from './actions';
import { AccountState, Action } from './types';

export const accountInitialState: AccountState = {
  tokenAccounts: [],
  nativeAccount: null,
  mintTokensAddresses: [],
  mintAccounts: [],
};

export const reducer = (state: AccountState, action: Action) => {
  switch (action.type) {
    case 'loadMintTokens':
      return {
        ...state,
        mintTokensAddresses: (action as LoadMintTokensAction).payload,
      };
    case 'loadMintAccounts':
      return {
        ...state,
        mintAccounts: (action as LoadMintAccountsAction).payload,
      };
    case 'loadTokenAccounts':
      return {
        ...state,
        tokenAccounts: (action as LoadTokenAccountsAction).payload
          .tokenAccounts,
      };
    case 'loadNativeAccount':
    case 'accountChanged':
      return {
        ...state,
        nativeAccount: (
          action as LoadNativeAccountAction | AccountChangedAction
        ).payload,
      };
    default:
      return state;
  }
};
