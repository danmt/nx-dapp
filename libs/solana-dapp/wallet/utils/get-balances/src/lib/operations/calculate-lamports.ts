import { TokenAccount } from '@nx-dapp/solana-dapp/account';

export const calculateLamports = (accounts: TokenAccount[]) => {
  return accounts.reduce(
    (res, account) => (res += account.info.amount.toNumber()),
    0
  );
};
