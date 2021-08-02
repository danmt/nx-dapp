import {
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { SerumMarket } from '@nx-dapp/solana-dapp/market/base';
import { Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  InitAction,
  LoadConnectionAction,
  LoadMarketAccountsAction,
  LoadMarketByMintAction,
  LoadMarketIndicatorAccountsAction,
  LoadMarketMintAccountsAction,
  LoadMarketMintsAction,
  LoadNativeAccountAction,
  LoadUserAccountsAction,
  LoadWalletConnectedAction,
  ResetAction,
} from './actions';

export interface MarketState {
  marketMints: string[];
  marketByMint: Map<string, SerumMarket>;
  marketAccounts: Map<string, ParsedAccountBase>;
  marketMintAccounts: Map<string, ParsedAccountBase>;
  marketIndicatorAccounts: Map<string, ParsedAccountBase>;
}

export type Action =
  | InitAction
  | LoadUserAccountsAction
  | LoadNativeAccountAction
  | LoadMarketMintsAction
  | LoadMarketAccountsAction
  | LoadMarketMintAccountsAction
  | LoadMarketIndicatorAccountsAction
  | LoadConnectionAction
  | LoadMarketByMintAction
  | ResetAction
  | LoadWalletConnectedAction;

export interface IMarketService {
  actions$: Observable<Action>;
  state$: Observable<MarketState>;
  marketByMint$: Observable<Map<string, SerumMarket>>;
  marketAccounts$: Observable<Map<string, ParsedAccountBase>>;
  marketMintAccounts$: Observable<Map<string, ParsedAccountBase>>;
  marketIndicatorAccounts$: Observable<Map<string, ParsedAccountBase>>;

  loadUserAccounts(userAccounts: TokenAccount[]): void;

  loadNativeAccount(nativeAccount: TokenAccount): void;

  loadConnection(connection: Connection): void;

  loadWalletConnected(walletConnected: boolean): void;
}
