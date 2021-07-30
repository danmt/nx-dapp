import {
  getMarketByMint,
  SerumMarket,
} from '@nx-dapp/solana/market-adapter/base';
import { LoadMarketMintsAction } from './actions';
import { Action, MarketState } from './types';

export const marketInitialState: MarketState = {
  marketMints: [],
  marketByMint: new Map<string, SerumMarket>(),
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
    default:
      return state;
  }
};
