import {
  AccountChangedAction,
  GetMintAccountsAction,
  LoadMarketAccountsAction,
  LoadMarketIndicatorAccountsAction,
  LoadMarketMintAccountsAction,
  LoadMintAccountsAction,
  LoadNativeAccountAction,
  LoadTokenAccountsAction,
} from './actions';
import { AccountState, Action } from './types';

export const accountInitialState: AccountState = {
  tokenAccounts: [],
  nativeAccount: null,
  selectedMintAddresses: [],
  mintAccounts: [],
  marketAccounts: [],
  marketMintAccounts: [],
  marketIndicatorAccounts: [],
};

export const reducer = (state: AccountState, action: Action) => {
  switch (action.type) {
    case 'getMintAccounts':
      return {
        ...state,
        selectedMintAddresses: (action as GetMintAccountsAction).payload,
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
    case 'loadMarketAccounts':
      return {
        ...state,
        marketAccounts: (action as LoadMarketAccountsAction).payload,
      };
    case 'loadMarketMintAccounts':
      return {
        ...state,
        marketMintAccounts: (action as LoadMarketMintAccountsAction).payload,
      };
    case 'loadMarketIndicatorAccounts':
      return {
        ...state,
        marketIndicatorAccounts: (action as LoadMarketIndicatorAccountsAction)
          .payload,
      };
    default:
      return state;
  }
};
