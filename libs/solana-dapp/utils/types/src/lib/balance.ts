import { Connection } from '@solana/web3.js';

export interface Balance {
  address: string;
  lamports: number;
  quantity: number;
  hasBalance: boolean;
  isNative: boolean;
  decimals: number;
  associatedTokenAddress?: string;
}

export interface GetBalancesFromWalletConfig {
  connection: string | Connection;
  walletAddress: string;
}

export interface GetBalanceConfig {
  connection: string | Connection;
  walletAddress: string;
  mintAddress: string;
}

export interface GetBalancesConfig {
  connection: string | Connection;
  walletAddress: string;
  mintAddresses: string[];
}

export interface GetBalanceForWalletConfig {
  connection: string | Connection;
  walletAddress: string;
}
