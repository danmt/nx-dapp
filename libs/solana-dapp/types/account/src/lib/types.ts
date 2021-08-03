import { u64 } from '@nx-dapp/solana-dapp/utils/u64';
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
