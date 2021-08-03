import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { SerumMarket, TokenDetails } from '@nx-dapp/solana-dapp/market/types';
import { TokenInfo } from '@solana/spl-token-registry';
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
  LoadNetworkAction,
  LoadNetworkTokensAction,
  LoadTokenAccountsAction,
} from './actions';

export interface MarketState {
  mintTokens: TokenDetails[];
  mintAccounts: Map<string, MintTokenAccount>;
  marketByMint: Map<string, SerumMarket>;
  marketAccounts: Map<string, ParsedAccountBase>;
  marketMintAccounts: Map<string, ParsedAccountBase>;
  marketIndicatorAccounts: Map<string, ParsedAccountBase>;
  networkTokens: Map<string, TokenInfo>;
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
  | LoadMintAccountsAction
  | LoadNetworkAction
  | LoadNetworkTokensAction;

export interface IMarketService {
  actions$: Observable<Action>;
  state$: Observable<MarketState>;
  mintTokens$: Observable<TokenDetails[]>;
  mintAccounts$: Observable<Map<string, MintTokenAccount>>;
  marketByMint$: Observable<Map<string, SerumMarket>>;
  marketAccounts$: Observable<Map<string, ParsedAccountBase>>;
  marketMintAccounts$: Observable<Map<string, ParsedAccountBase>>;
  marketIndicatorAccounts$: Observable<Map<string, ParsedAccountBase>>;
  networkTokens$: Observable<Map<string, TokenInfo>>;

  loadTokenAccounts(tokenAccounts: Map<string, TokenAccount>): void;

  loadConnection(connection: Connection): void;
}
