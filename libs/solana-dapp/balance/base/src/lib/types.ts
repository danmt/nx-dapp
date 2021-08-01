import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/base';

export interface Balance {
  lamports: number;
  tokenQuantity: number;
  tokenPrice: number;
  tokenInUSD: number;
  hasBalance: boolean;
  accounts: ParsedAccountBase[];
}
