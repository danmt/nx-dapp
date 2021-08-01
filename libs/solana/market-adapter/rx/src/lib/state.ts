import {
  getMarketByMint,
  SerumMarket,
} from '@nx-dapp/solana/market-adapter/base';
import {
  LoadMarketAccountsAction,
  LoadMarketIndicatorAccountsAction,
  LoadMarketMintAccountsAction,
  LoadMarketMintsAction,
} from './actions';
import { Action, MarketState } from './types';

export const marketInitialState: MarketState = {
  marketMints: [],
  marketByMint: new Map<string, SerumMarket>(),
  marketAccounts: [],
  marketMintAccounts: [],
  marketIndicatorAccounts: [],
};

export const reducer = (state: MarketState, action: Action) => {
  switch (action.type) {
    case 'loadMarketMints':
      return {
        ...state,
        marketMints: (action as LoadMarketMintsAction).payload,
        marketByMint: getMarketByMint([
          ...new Set((action as LoadMarketMintsAction).payload).values(),
        ]),
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
