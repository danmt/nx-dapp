import { MintTokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { getMarket } from '.';

export const getMarketAddress = (
  mintAccount: MintTokenAccount
): string | null => getMarket(mintAccount.pubkey.toBase58())?.address || null;
