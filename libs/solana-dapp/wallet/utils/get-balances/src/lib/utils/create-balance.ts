import { MintTokenAccount, TokenAccount } from '@nx-dapp/solana-dapp/account';
import { Balance } from '@nx-dapp/solana-dapp/wallet/types';

import { calculateLamports, calculateQuantity } from '../operations';

export const createBalance = (
  userAccounts: TokenAccount[],
  mintAccount: MintTokenAccount
): Balance => {
  const filteredUserAccounts = userAccounts.filter(
    (userAccount) =>
      userAccount.info.mint.toBase58() === mintAccount.pubkey.toBase58()
  );
  const lamports = calculateLamports(filteredUserAccounts);
  const quantity = calculateQuantity(lamports, mintAccount.info);

  return {
    address: mintAccount.pubkey.toBase58(),
    lamports,
    quantity,
    hasBalance: quantity > 0 && filteredUserAccounts.length > 0,
  };
};
