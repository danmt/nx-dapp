import { Action, BalanceState } from './types';

export const balanceInitialState: BalanceState = {
  balances: [],
};

export const reducer = (state: BalanceState, action: Action) => {
  switch (action.type) {
    default:
      return state;
  }
};
