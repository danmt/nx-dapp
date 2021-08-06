import { MarketAccount } from '@nx-dapp/solana-dapp/account/types';

export const getMarketOrderbookAddresses = (
  marketAccount: MarketAccount
): string[] => [
  marketAccount.info.asks.toBase58(),
  marketAccount.info.bids.toBase58(),
];
