import { ParsedAccountBase } from '@nx-dapp/solana-dapp/types/account';

export interface Balance {
  tokenName: string | null;
  tokenSymbol: string | null;
  tokenLogo: string | null;
  mintAddress: string;
  lamports: number;
  tokenQuantity: number;
  tokenPrice: number;
  tokenInUSD: number;
  hasBalance: boolean;
  accounts: ParsedAccountBase[];
}
