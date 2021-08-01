import {
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana/account-adapter/base';
import { SerumMarket } from '@nx-dapp/solana/market-adapter/base';
import { Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  InitAction,
  LoadMarketAccountsAction,
  LoadMarketIndicatorAccountsAction,
  LoadMarketMintAccountsAction,
  LoadMarketMintsAction,
  LoadNativeAccountAction,
  LoadUserAccountsAction,
} from './actions';

export interface MarketState {
  marketMints: string[];
  marketByMint: Map<string, SerumMarket>;
  marketAccounts: ParsedAccountBase[];
  marketMintAccounts: ParsedAccountBase[];
  marketIndicatorAccounts: ParsedAccountBase[];
}

export type Action =
  | InitAction
  | LoadUserAccountsAction
  | LoadNativeAccountAction
  | LoadMarketMintsAction
  | LoadMarketAccountsAction
  | LoadMarketMintAccountsAction
  | LoadMarketIndicatorAccountsAction;

export interface IMarketService {
  actions$: Observable<Action>;
  state$: Observable<MarketState>;
  marketByMint$: Observable<Map<string, SerumMarket>>;
  marketAccounts$: Observable<ParsedAccountBase[]>;
  marketMintAccounts$: Observable<ParsedAccountBase[]>;
  marketIndicatorAccounts$: Observable<ParsedAccountBase[]>;

  loadUserAccounts(userAccounts: TokenAccount[]): void;

  loadNativeAccount(nativeAccount: TokenAccount): void;

  loadConnection(connection: Connection): void;
}
