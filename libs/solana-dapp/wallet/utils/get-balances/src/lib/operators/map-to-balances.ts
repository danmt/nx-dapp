import { MintTokenAccount, TokenAccount } from '@nx-dapp/solana-dapp/account';
import { Balance } from '@nx-dapp/solana-dapp/wallet/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
