import { Connection, PublicKey } from '@solana/web3.js';

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

export interface GetPriceConfig {
  connection: string | Connection;
  marketConnection: string | Connection;
  mintAddress: string;
}

export interface GetPricesConfig {
  connection: string | Connection;
  marketConnection: string | Connection;
  mintAddresses: string[];
}

export interface GetPricesFromWalletConfig {
  connection: string | Connection;
  marketConnection: string | Connection;
  walletAddress: string;
}
