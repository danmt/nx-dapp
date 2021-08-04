import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { MintParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { calculateLamports, calculateQuantity } from '../operations';

import { Balance } from '../types';

const createBalance = (
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
export const mapToBalances =
  (tokenAccounts: TokenAccount[]) =>
  (
    source: Observable<{ array: AccountInfo<Buffer>[]; keys: string[] }>
  ): Observable<Balance[]> =>
    source.pipe(
      map(({ array: mintAccounts, keys }) =>
        mintAccounts.map((account, index) =>
          createBalance(
            tokenAccounts,
            MintParser(new PublicKey(keys[index]), account)
          )
        )
      )
    );
