import { MintTokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { Market } from '@nx-dapp/solana-dapp/market/types';

import { getMarket } from '../operations';

export const getMarketAddresses = (
  mintAccounts: MintTokenAccount[]
): string[] =>
  mintAccounts
    .map((mintAddress) => getMarket(mintAddress.pubkey.toBase58()))
    .filter((market): market is Market => market !== null)
    .map((market) => market.address);
