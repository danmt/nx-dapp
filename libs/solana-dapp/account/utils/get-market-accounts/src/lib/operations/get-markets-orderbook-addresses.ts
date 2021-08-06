import { MarketAccount } from '@nx-dapp/solana-dapp/account/types';

export const getMarketsOrderbookAddresses = (
  marketAccounts: MarketAccount[]
): string[] => [
  ...new Set(
    marketAccounts.reduce(
      (marketMintAccounts: string[], marketAccount: MarketAccount) => [
        ...marketMintAccounts,
        marketAccount.info.asks.toBase58(),
        marketAccount.info.bids.toBase58(),
      ],
      []
    )
  ).values(),
];
