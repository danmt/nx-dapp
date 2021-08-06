import {
  MarketAccount,
  MintTokenAccount,
  OrderbookAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { TokenPrice } from '@nx-dapp/solana-dapp/market/types';
import { calculateMidPrice2 } from '.';

export const createTokenPrice = (
  mintAccount: MintTokenAccount,
  marketAccount: MarketAccount,
  marketMintAccounts: MintTokenAccount[],
  orderbookAccounts: OrderbookAccount[]
): TokenPrice | null => {
  return {
    address: mintAccount.pubkey.toBase58(),
    price: calculateMidPrice2(
      mintAccount,
      marketAccount,
      marketMintAccounts,
      orderbookAccounts
    ),
  };
};
