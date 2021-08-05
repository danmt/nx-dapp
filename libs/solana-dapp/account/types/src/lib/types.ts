import { u64 } from '@nx-dapp/solana-dapp/utils/u64';
import { Slab } from '@project-serum/serum/lib/slab';
import { MintInfo } from '@solana/spl-token';
import { AccountInfo, PublicKey } from '@solana/web3.js';

export interface ParsedAccountBase {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
  info: any;
}

export interface TokenAccountInfo {
  address: PublicKey;
  mint: PublicKey;
  owner: PublicKey;
  amount: u64;
  delegate: null | PublicKey;
  delegatedAmount: u64;
  isInitialized: boolean;
  isFrozen: boolean;
  isNative: boolean;
  rentExemptReserve: null | u64;
  closeAuthority: null | PublicKey;
}

export interface TokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
  info: TokenAccountInfo;
}

export interface MintTokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
  info: MintInfo;
}

export interface MarketAccountFlags {
  asks: boolean;
  bids: boolean;
  eventQueue: boolean;
  initialized: boolean;
  market: boolean;
  openOrders: boolean;
  requestQueue: boolean;
}

export interface MarketAccountInfo {
  accountFlags: MarketAccountFlags;
  asks: PublicKey;
  bids: PublicKey;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  programId: PublicKey;
}

export interface MarketAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
  info: MarketAccountInfo;
}

export interface OrderbookAccountInfo {
  accountFlags: MarketAccountFlags;
  slab: Slab;
}

export interface OrderbookAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
  info: OrderbookAccountInfo;
}
