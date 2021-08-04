import {
  MintTokenAccount,
  ParsedAccountBase,
} from '@nx-dapp/solana-dapp/account/types';
import { calculateLamports, calculateQuantity } from '../operations';
import { Balance } from '../types';

export const createBalance = (
  tokenAccounts: ParsedAccountBase[],
  mintAccount: MintTokenAccount
): Balance => {
  const accounts = tokenAccounts.filter(
    (tokenAccount) =>
      tokenAccount.info.mint.toBase58() === mintAccount.pubkey.toBase58()
  );
  const lamports = calculateLamports(accounts);
  const quantity = calculateQuantity(lamports, mintAccount.info);

  return {
    address: mintAccount.pubkey.toBase58(),
    lamports,
    quantity,
    hasBalance: quantity > 0 && accounts.length > 0,
  };
};
