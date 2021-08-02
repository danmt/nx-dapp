import { LoadBalancesAction, LoadMintTokensAction } from './actions';
import { Action, BalanceState } from './types';

export const balanceInitialState: BalanceState = {
  balances: [],
  totalInUSD: 0,
  mintTokens: [],
};

export const reducer = (state: BalanceState, action: Action) => {
  switch (action.type) {
    case 'loadMintTokens':
      return {
        ...state,
        mintTokens: (action as LoadMintTokensAction).payload,
      };
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
