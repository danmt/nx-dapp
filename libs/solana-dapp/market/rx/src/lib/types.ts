import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { SerumMarket, TokenDetails } from '@nx-dapp/solana-dapp/market/base';
import { Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  InitAction,
  LoadConnectionAction,
  LoadMarketAccountsAction,
  LoadMarketByMintAction,
  LoadMarketIndicatorAccountsAction,
  LoadMarketMintAccountsAction,
  LoadMintAccountsAction,
  LoadMintTokensAction,
  LoadTokenAccountsAction,
} from './actions';

export interface MarketState {
  mintTokens: TokenDetails[];
  mintAccounts: Map<string, MintTokenAccount>;
  marketByMint: Map<string, SerumMarket>;
  marketAccounts: Map<string, ParsedAccountBase>;
  marketMintAccounts: Map<string, ParsedAccountBase>;
  marketIndicatorAccounts: Map<string, ParsedAccountBase>;
}

export type Action =
  | InitAction
  | LoadTokenAccountsAction
  | LoadMarketAccountsAction
  | LoadMarketMintAccountsAction
  | LoadMarketIndicatorAccountsAction
  | LoadConnectionAction
  | LoadMarketByMintAction
  | LoadMintTokensAction
  | LoadMintAccountsAction;

export interface IMarketService {
  actions$: Observable<Action>;
  state$: Observable<MarketState>;
  mintTokens$: Observable<TokenDetails[]>;
  mintAccounts$: Observable<Map<string, MintTokenAccount>>;
  marketByMint$: Observable<Map<string, SerumMarket>>;
  marketAccounts$: Observable<Map<string, ParsedAccountBase>>;
  marketMintAccounts$: Observable<Map<string, ParsedAccountBase>>;
  marketIndicatorAccounts$: Observable<Map<string, ParsedAccountBase>>;

  loadTokenAccounts(tokenAccounts: Map<string, TokenAccount>): void;

  loadConnection(connection: Connection): void;
}
