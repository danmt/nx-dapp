import { MintTokenAccount, TokenAccount } from '@nx-dapp/solana-dapp/account';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Balance } from '../types';
import { createBalance } from '../utils';

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
