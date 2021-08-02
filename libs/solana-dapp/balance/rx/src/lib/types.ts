import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { Balance, TokenDetails } from '@nx-dapp/solana-dapp/balance/base';
import { SerumMarket } from '@nx-dapp/solana-dapp/market/base';
import { TokenInfo } from '@solana/spl-token-registry';
import { Observable } from 'rxjs';

import {
  InitAction,
  LoadBalancesAction,
  LoadMarketAccountsAction,
  LoadMarketByMintAction,
  LoadMarketIndicatorAccountsAction,
  LoadMarketMintAccountsAction,
  LoadMintAccountsAction,
  LoadMintTokensAction,
  LoadNetworkTokensAction,
  LoadUserAccountsAction,
  LoadWalletConnectedAction,
  ResetAction,
} from './actions';

export type Action =
  | InitAction
  | LoadUserAccountsAction
  | LoadBalancesAction
  | LoadMarketByMintAction
  | LoadMintTokensAction
  | LoadMintAccountsAction
  | LoadMarketAccountsAction
  | LoadMarketIndicatorAccountsAction
  | LoadMarketMintAccountsAction
  | LoadNetworkTokensAction
  | LoadWalletConnectedAction
  | ResetAction;

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

  loadMintAccounts(mintAccounts: Map<string, MintTokenAccount>): void;

  loadMintTokens(mintTokens: TokenDetails[]): void;

  loadUserAccounts(userAccounts: TokenAccount[]): void;

  loadMarketByMint(marketByMint: Map<string, SerumMarket>): void;

  loadNetworkTokens(networkTokens: Map<string, TokenInfo>): void;

  loadWalletConnected(walletConnected: boolean): void;
}
