import { MintTokenAccount } from '@nx-dapp/solana-dapp/account';

import { getMarket } from '../operations';
import { Market } from '../types';

export const getMarketAddresses = (
  mintAccounts: MintTokenAccount[]
): string[] =>
  mintAccounts
    .map((mintAddress) => getMarket(mintAddress.pubkey.toBase58()))
    .filter((market): market is Market => market !== null)
    .map((market) => market.address);
