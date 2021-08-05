import {
  MintTokenAccount,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { Balance } from '@nx-dapp/solana-dapp/wallet/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { calculateLamports, calculateQuantity } from '../operations';

const createBalance = (
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

export const mapToBalances =
  (userAccounts: TokenAccount[]) =>
  (source: Observable<MintTokenAccount[]>): Observable<Balance[]> =>
    source.pipe(
      map((mintAccounts) =>
        mintAccounts.map((mintAccount) =>
          createBalance(userAccounts, mintAccount)
        )
      )
    );
