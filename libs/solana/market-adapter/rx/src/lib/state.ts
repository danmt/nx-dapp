import { Action, MarketState, SerumMarket } from './types';

export const marketInitialState: MarketState = {
  marketByMint: new Map<string, SerumMarket>(),
};

export const reducer = (state: MarketState, action: Action) => {
  switch (action.type) {
    default:
      return state;
  }
};
