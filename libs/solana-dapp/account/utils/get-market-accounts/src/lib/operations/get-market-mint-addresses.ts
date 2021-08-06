import { MarketAccount } from '@nx-dapp/solana-dapp/account/types';

export const getMarketMintAddresses = (
  marketAccount: MarketAccount
): string[] => [
  marketAccount.info.baseMint.toBase58(),
  marketAccount.info.quoteMint.toBase58(),
];
