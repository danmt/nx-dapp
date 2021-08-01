import { Balance, TokenDetails } from '@nx-dapp/solana-dapp/balance/base';
import { Observable } from 'rxjs';

import {
  InitAction,
  LoadBalancesAction,
  LoadUserAccountsAction,
  LoadMarketByMintAction,
  LoadMintAccountsAction,
  LoadMarketAccountsAction,
  LoadMintTokensAction,
} from './actions';
import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { SerumMarket } from '@nx-dapp/solana-dapp/market/base';

export type Action =
  | InitAction
  | LoadUserAccountsAction
  | LoadBalancesAction
  | LoadMarketByMintAction
  | LoadMintTokensAction
  | LoadMintAccountsAction
  | LoadMarketAccountsAction;

export interface BalanceState {
  balances: Balance[];
  totalInUSD: number;
  mintTokens: TokenDetails[];
}

export interface IBalanceService {
  state$: Observable<BalanceState>;
  actions$: Observable<Action>;
  balances$: Observable<Balance[]>;
  totalInUSD$: Observable<number>;

  loadMarketAccounts(marketAccounts: Map<string, ParsedAccountBase>): void;

  loadMarketMintAccounts(
    marketMintAccounts: Map<string, ParsedAccountBase>
  ): void;

  loadMarketIndicatorAccounts(
    marketIndicatorAccounts: Map<string, ParsedAccountBase>
  ): void;

  loadMintAccounts(mintAccounts: MintTokenAccount[]): void;

  loadMintTokens(mintTokens: TokenDetails[]): void;

  loadUserAccounts(userAccounts: TokenAccount[]): void;

  loadMarketByMint(marketByMint: Map<string, SerumMarket>): void;
}
