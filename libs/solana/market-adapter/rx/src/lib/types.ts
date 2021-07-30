import { TokenAccount } from '@nx-dapp/solana/account-adapter/base';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  InitAction,
  LoadMarketMintsAction,
  LoadUserAccountsAction,
} from './actions';

export interface MarketState {
  marketMints: string[];
  marketByMint: Map<string, SerumMarket>;
}

export type Action =
  | InitAction
  | LoadUserAccountsAction
  | LoadMarketMintsAction;

export interface IMarketService {
  actions$: Observable<Action>;
  state$: Observable<MarketState>;

  loadUserAccounts(userAccounts: TokenAccount[]): void;
}

export interface SerumMarket {
  marketInfo: {
    address: PublicKey;
    name: string;
    programId: PublicKey;
    deprecated: boolean;
  };

  // 1st query
  marketAccount?: AccountInfo<Buffer>;

  // 2nd query
  mintBase?: AccountInfo<Buffer>;
  mintQuote?: AccountInfo<Buffer>;
  bidAccount?: AccountInfo<Buffer>;
  askAccount?: AccountInfo<Buffer>;
  eventQueue?: AccountInfo<Buffer>;

  swap?: {
    dailyVolume: number;
  };

  midPrice?: (mint?: PublicKey) => number;
}
