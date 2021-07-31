import { LoadBalancesAction } from './actions';
import { Action, BalanceState } from './types';

export const balanceInitialState: BalanceState = {
  balances: [],
};

export const reducer = (state: BalanceState, action: Action) => {
  switch (action.type) {
    case 'loadBalances':
      return {
        ...state,
        balances: (action as LoadBalancesAction).payload,
      };
    default:
      return state;
  }
};
