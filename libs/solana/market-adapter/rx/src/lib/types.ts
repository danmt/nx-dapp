import { AccountInfo, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';

import { InitAction } from './actions';

export interface MarketState {
  marketByMint: Map<string, SerumMarket>;
}

export type Action = InitAction;

export interface IMarketService {
  actions$: Observable<Action>;
  state$: Observable<MarketState>;
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
