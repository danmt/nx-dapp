import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { getNativeAccount, getTokenAccounts } from '..';

export const getUserAccounts = (
  connection: Connection,
  walletPublicKey: PublicKey
): Observable<TokenAccount[]> =>
  getNativeAccount(connection, walletPublicKey).pipe(
    switchMap((nativeAccount) =>
      getTokenAccounts(connection, walletPublicKey).pipe(
        map((tokenAccounts) => [nativeAccount, ...tokenAccounts])
      )
    )
  );
