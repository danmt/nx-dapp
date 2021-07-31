import { ParsedAccountBase } from '@nx-dapp/solana/account-adapter/base';

export interface Balance {
  lamports: number;
  tokenQuantity: number;
  tokenPrice: number;
  tokenInUSD: number;
  hasBalance: boolean;
  accounts: ParsedAccountBase[];
}
