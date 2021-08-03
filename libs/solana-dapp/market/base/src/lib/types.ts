import { AccountInfo, PublicKey } from '@solana/web3.js';

export interface MarketInfo {
  address: PublicKey;
  programId: PublicKey;
  name: string;
  deprecated: boolean;
}

export interface SerumMarket {
  marketInfo: MarketInfo;

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

export interface TokenDetails {
  pubkey: PublicKey;
  address: string;
  label: string;
}
