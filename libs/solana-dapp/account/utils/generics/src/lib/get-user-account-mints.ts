import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';

export const getUserAccountMints = (userAccounts: TokenAccount[]) => [
  ...new Set(userAccounts.map(({ info }) => info.mint.toBase58())).values(),
];
