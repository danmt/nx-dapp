import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { Balance } from '@nx-dapp/solana-dapp/balance/base';
import { SerumMarket, TokenDetails } from '@nx-dapp/solana-dapp/market/base';
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
  LoadTokenAccountsAction,
  LoadWalletConnectedAction,
  ResetAction,
} from './actions';

export type Action =
  | InitAction
  | LoadTokenAccountsAction
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

  loadTokenAccounts(tokenAccounts: Map<string, TokenAccount>): void;

  loadMarketByMint(marketByMint: Map<string, SerumMarket>): void;

  loadNetworkTokens(networkTokens: Map<string, TokenInfo>): void;

  loadWalletConnected(walletConnected: boolean): void;

  loadMintTokens(mintTokens: TokenDetails[]): void;
}
