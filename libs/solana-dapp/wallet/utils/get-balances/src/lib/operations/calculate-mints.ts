import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';

export const calculateMints = (userAccounts: TokenAccount[]) => [
  ...new Set(userAccounts.map(({ info }) => info.mint.toBase58())).values(),
];
