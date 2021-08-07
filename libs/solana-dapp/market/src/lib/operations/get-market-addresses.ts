import { MintTokenAccount } from '@nx-dapp/solana-dapp/account';

import { getMarketByBaseMint } from '.';
import { Market } from '../types';

export const getMarketAddresses = (
  mintAccounts: MintTokenAccount[]
): string[] =>
  mintAccounts
    .map((mintAddress) => getMarketByBaseMint(mintAddress.pubkey.toBase58()))
    .filter((market): market is Market => market !== null)
    .map((market) => market.address);
