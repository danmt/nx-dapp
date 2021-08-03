import {
  MintTokenAccount,
  ParsedAccountBase,
} from '@nx-dapp/solana-dapp/account/base';
import { SerumMarket } from '@nx-dapp/solana-dapp/market/base';

import {
  LoadMarketAccountsAction,
  LoadMarketByMintAction,
  LoadMarketIndicatorAccountsAction,
  LoadMarketMintAccountsAction,
  LoadMintAccountsAction,
  LoadMintTokensAction,
} from './actions';
import { Action, MarketState } from './types';

export const marketInitialState: MarketState = {
  mintTokens: [],
  mintAccounts: new Map<string, MintTokenAccount>(),
  marketByMint: new Map<string, SerumMarket>(),
  marketMintAccounts: new Map<string, ParsedAccountBase>(),
  marketIndicatorAccounts: new Map<string, ParsedAccountBase>(),
  marketAccounts: new Map<string, ParsedAccountBase>(),
};

export const reducer = (state: MarketState, action: Action) => {
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
    case 'loadMarketByMint':
      return {
        ...state,
        marketByMint: (action as LoadMarketByMintAction).payload,
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
    case 'reset':
      return {
        ...state,
        marketByMint: new Map<string, SerumMarket>(),
        marketMintAccounts: new Map<string, ParsedAccountBase>(),
        marketIndicatorAccounts: new Map<string, ParsedAccountBase>(),
        marketAccounts: new Map<string, ParsedAccountBase>(),
      };
    default:
      return state;
  }
};
