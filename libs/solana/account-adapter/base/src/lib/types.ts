import { AccountInfo, PublicKey } from '@solana/web3.js';
import { u64 } from '@nx-dapp/solana/utils/u64';

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
