import {
  MintTokenAccount,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/base';
import {
  AccountChangedAction,
  LoadMintAccountsAction,
  LoadMintTokensAction,
  LoadNativeAccountAction,
  LoadTokenAccountsAction,
} from './actions';
import { AccountState, Action } from './types';

export const accountInitialState: AccountState = {
  tokenAccounts: new Map<string, TokenAccount>(),
  nativeAccount: null,
  mintTokensAddresses: [],
  mintAccounts: new Map<string, MintTokenAccount>(),
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
        mintAccounts: [
          ...(action as LoadMintAccountsAction).payload.values(),
        ].reduce(
          (mintAccounts, account) =>
            mintAccounts.set(account.pubkey.toBase58(), account),
          new Map<string, MintTokenAccount>()
        ),
      };
    case 'loadTokenAccounts':
      return {
        ...state,
        tokenAccounts: [
          ...(action as LoadTokenAccountsAction).payload.values(),
          state.nativeAccount,
        ]
          .filter((token): token is TokenAccount => token !== null)
          .reduce(
            (tokenAccounts, account) =>
              tokenAccounts.set(account.pubkey.toBase58(), account),
            new Map<string, TokenAccount>()
          ),
      };
    case 'loadNativeAccount':
    case 'accountChanged':
      return {
        ...state,
        nativeAccount: (
          action as LoadNativeAccountAction | AccountChangedAction
        ).payload,
        tokenAccounts: [
          ...state.tokenAccounts.values(),
          (action as LoadNativeAccountAction | AccountChangedAction).payload,
        ].reduce(
          (tokenAccounts, account) =>
            tokenAccounts.set(account.pubkey.toBase58(), account),
          new Map<string, TokenAccount>()
        ),
      };
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
