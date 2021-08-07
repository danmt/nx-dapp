import { MintTokenAccount, TokenAccount } from '@nx-dapp/solana-dapp/account';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Balance } from '../types';
import { createBalance } from '../utils';

export const mapToBalance =
  (userAccounts: TokenAccount[]) =>
  (source: Observable<MintTokenAccount | null>): Observable<Balance | null> =>
    source.pipe(
      map((mintAccount) =>
        mintAccount ? createBalance(userAccounts, mintAccount) : null
      )
    );
