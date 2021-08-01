import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/base';
import { PublicKey } from '@solana/web3.js';

export interface Balance {
  tokenName: string;
  mintAddress: string;
  lamports: number;
  tokenQuantity: number;
  tokenPrice: number;
  tokenInUSD: number;
  hasBalance: boolean;
  accounts: ParsedAccountBase[];
}

export interface TokenDetails {
  pubkey: PublicKey;
  address: string;
  label: string;
}
