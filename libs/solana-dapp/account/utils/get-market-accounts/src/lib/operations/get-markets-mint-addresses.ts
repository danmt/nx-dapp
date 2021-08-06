import { MarketAccount } from '@nx-dapp/solana-dapp/account/types';

export const getMarketsMintAddresses = (
  marketAccounts: MarketAccount[]
): string[] => [
  ...new Set(
    marketAccounts.reduce(
      (marketMintAccounts: string[], marketAccount: MarketAccount) => [
        ...marketMintAccounts,
        marketAccount.info.baseMint.toBase58(),
        marketAccount.info.quoteMint.toBase58(),
      ],
      []
    )
  ).values(),
];
