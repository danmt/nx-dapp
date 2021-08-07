import { MintTokenAccount, TokenAccount } from '@nx-dapp/solana-dapp/account';
import { Balance } from '@nx-dapp/solana-dapp/wallet/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { createBalance } from '../utils';

export const mapToBalance =
  (userAccounts: TokenAccount[]) =>
  (source: Observable<MintTokenAccount | null>): Observable<Balance | null> =>
    source.pipe(
      map((mintAccount) =>
        mintAccount ? createBalance(userAccounts, mintAccount) : null
      )
    );
