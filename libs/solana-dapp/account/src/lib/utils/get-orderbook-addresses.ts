import { MarketAccount } from '@nx-dapp/solana-dapp/account';

export const getOrderbookAddresses = (
  marketAccount: MarketAccount
): string[] => [
  marketAccount.info.asks.toBase58(),
  marketAccount.info.bids.toBase58(),
];
