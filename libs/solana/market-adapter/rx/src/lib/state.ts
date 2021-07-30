import { LoadMarketMintsAction } from './actions';
import { Action, MarketState, SerumMarket } from './types';

export const marketInitialState: MarketState = {
  marketMints: [],
  marketByMint: new Map<string, SerumMarket>(),
};

export const reducer = (state: MarketState, action: Action) => {
  switch (action.type) {
    case 'loadMarketMints': {
      return {
        ...state,
        marketMints: (action as LoadMarketMintsAction).payload,
      };
    }
    default:
      return state;
  }
};
