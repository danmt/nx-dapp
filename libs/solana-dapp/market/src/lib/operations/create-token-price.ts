import {
  MarketAccount,
  MintTokenAccount,
  OrderbookAccount,
} from '@nx-dapp/solana-dapp/account';

import { calculateMidPrice } from '.';
import { TokenPrice } from '../types';

export const createTokenPrice = (
  mintAccount: MintTokenAccount,
  marketAccount: MarketAccount,
  marketMintAccounts: MintTokenAccount[],
  orderbookAccounts: OrderbookAccount[]
): TokenPrice | null => {
  return {
    address: mintAccount.pubkey.toBase58(),
    price: calculateMidPrice(
      mintAccount,
      marketAccount,
      marketMintAccounts,
      orderbookAccounts
    ),
  };
};
