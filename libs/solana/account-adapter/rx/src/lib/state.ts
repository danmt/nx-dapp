import { LoadNativeAccountAction, LoadTokenAccountsAction } from './actions';
import { AccountState, Action } from './types';

export const accountInitialState: AccountState = {
  userAccounts: [],
  tokenAccounts: [],
  nativeAccount: null,
};

export const reducer = (state: AccountState, action: Action) => {
  switch (action.type) {
    case 'loadTokenAccounts':
      return {
        ...state,
        tokenAccounts: (action as LoadTokenAccountsAction).payload
          .tokenAccounts,
        userAccounts: (
          action as LoadTokenAccountsAction
        ).payload.tokenAccounts.filter(
          (account) =>
            account.info.owner.toBase58() ===
            (
              action as LoadTokenAccountsAction
            ).payload.walletPublicKey.toBase58()
        ),
      };
    case 'loadNativeAccount':
    case 'accountChanged':
      return {
        ...state,
        nativeAccount: (action as LoadNativeAccountAction).payload,
      };
    default:
      return state;
  }
};
