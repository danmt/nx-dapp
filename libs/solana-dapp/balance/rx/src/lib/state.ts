import { LoadBalancesAction } from './actions';
import { Action, BalanceState } from './types';

export const balanceInitialState: BalanceState = {
  balances: [],
  totalInUSD: 0,
};

export const reducer = (state: BalanceState, action: Action) => {
  switch (action.type) {
    case 'loadBalances':
      return {
        ...state,
        balances: (action as LoadBalancesAction).payload,
        totalInUSD: (action as LoadBalancesAction).payload.reduce(
          (totalInUSD, balance) => totalInUSD + balance.tokenInUSD,
          0
        ),
      };
    case 'reset':
      return {
        ...state,
        balances: [],
        totalInUSD: 0,
      };
    default:
      return state;
  }
};
