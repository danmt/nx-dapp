import { TokenAccount } from '@nx-dapp/solana-dapp/account/base';

import {
  AccountChangedAction,
  LoadNativeAccountAction,
  LoadTokenAccountsAction,
} from './actions';
import { AccountState, Action } from './types';

export const accountInitialState: AccountState = {
  tokenAccounts: new Map<string, TokenAccount>(),
  nativeAccount: null,
};

export const reducer = (state: AccountState, action: Action) => {
  switch (action.type) {
    case 'loadTokenAccounts': {
      const tokenAccounts = (action as LoadTokenAccountsAction).payload;
      const nativeAccount = state.nativeAccount;

      if (nativeAccount) {
        tokenAccounts.set(nativeAccount.pubkey.toBase58(), nativeAccount);
      }

      return {
        ...state,
        tokenAccounts: new Map(tokenAccounts),
      };
    }
    case 'loadNativeAccount':
    case 'accountChanged': {
      const nativeAccount = (
        action as LoadNativeAccountAction | AccountChangedAction
      ).payload;
      const tokenAccounts = state.tokenAccounts.set(
        nativeAccount.pubkey.toBase58(),
        nativeAccount
      );

      return {
        ...state,
        nativeAccount,
        tokenAccounts: new Map(tokenAccounts),
      };
    }
    case 'reset':
      return {
        ...state,
        nativeAccount: null,
        tokenAccounts: new Map<string, TokenAccount>(),
      };
    default:
      return state;
  }
};
