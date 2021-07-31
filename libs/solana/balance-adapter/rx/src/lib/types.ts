import { Balance } from '@nx-dapp/solana/balance-adapter/base';
import { Observable } from 'rxjs';

import {
  InitAction,
  LoadBalancesAction,
  LoadUserAccountsAction,
  LoadMarketByMintAction,
  LoadMintAccountsAction,
} from './actions';
import {
  MintTokenAccount,
  TokenAccount,
} from '@nx-dapp/solana/account-adapter/base';
import { SerumMarket } from '@nx-dapp/solana/market-adapter/base';

export type Action =
  | InitAction
  | LoadUserAccountsAction
  | LoadBalancesAction
  | LoadMarketByMintAction
  | LoadMintAccountsAction;

export interface BalanceState {
  balances: Balance[];
}

export interface IBalanceService {
  state$: Observable<BalanceState>;
  actions$: Observable<Action>;

  loadMintAccounts(mintAccounts: MintTokenAccount[]): void;

  loadUserAccounts(userAccounts: TokenAccount[]): void;

  loadMarketByMint(marketByMint: Map<string, SerumMarket>): void;
}
