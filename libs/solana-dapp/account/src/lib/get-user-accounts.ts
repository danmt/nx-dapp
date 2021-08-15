import {
  getNativeAccount,
  getTokenAccountsByOwner,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { observeNativeAccount, observeTokenAccounts } from '..';

export const getUserAccounts = (
  connection: Connection,
  walletPublicKey: PublicKey
): Observable<TokenAccount[]> =>
  getNativeAccount(connection, walletPublicKey).pipe(
    observeNativeAccount(connection),
    switchMap((nativeAccount) =>
      getTokenAccountsByOwner(connection, walletPublicKey).pipe(
        observeTokenAccounts(connection),
        map((tokenAccounts) => [nativeAccount, ...tokenAccounts])
      )
    )
  );
