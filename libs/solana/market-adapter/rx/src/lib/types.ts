import { TokenAccount } from '@nx-dapp/solana/account-adapter/base';
import { SerumMarket } from '@nx-dapp/solana/market-adapter/base';
import { Observable } from 'rxjs';

import {
  InitAction,
  LoadMarketMintsAction,
  LoadNativeAccountAction,
  LoadUserAccountsAction,
} from './actions';

export interface MarketState {
  marketMints: string[];
  marketByMint: Map<string, SerumMarket>;
}

export type Action =
  | InitAction
  | LoadUserAccountsAction
  | LoadNativeAccountAction
  | LoadMarketMintsAction;

export interface IMarketService {
  actions$: Observable<Action>;
  state$: Observable<MarketState>;
  marketByMint$: Observable<Map<string, SerumMarket>>;

  loadUserAccounts(userAccounts: TokenAccount[]): void;

  loadNativeAccount(nativeAccount: TokenAccount): void;
}
