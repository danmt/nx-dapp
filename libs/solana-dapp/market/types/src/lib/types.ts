import { AccountInfo, PublicKey } from '@solana/web3.js';

export interface MarketInfo {
  address: PublicKey;
  programId: PublicKey;
  name: string;
  deprecated: boolean;
}

export interface SerumMarket {
  marketInfo: MarketInfo;
  marketAccount?: AccountInfo<Buffer>;
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

export interface TokenPrice {
  address: string;
  price: number;
}

export interface Market {
  mint: string;
  address: string;
  name: string;
  programId: string;
  deprecated: boolean;
}

export interface GetPricesConfig {
  walletPublicKey: string;
  rpcEndpoint: string;
  marketRpcEndpoint: string;
}
