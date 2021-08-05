import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { fromAccountChangeEvent } from '@nx-dapp/solana-dapp/account/utils/from-account-change';
import { TokenAccountParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { AccountInfo, Connection } from '@solana/web3.js';
import { combineLatest, Observable } from 'rxjs';
import { concatMap, map, startWith, switchMap } from 'rxjs/operators';

import { getNativeAccount } from '../utils';

const fromNativeAccountChangeEvent = (
  connection: Connection,
  nativeAccount: TokenAccount
) =>
  fromAccountChangeEvent(connection, nativeAccount.pubkey).pipe(
    concatMap(() => getNativeAccount(connection, nativeAccount.pubkey)),
    startWith(nativeAccount)
  );

const fromTokenAccountChangeEvent = (
  connection: Connection,
  tokenAccount: TokenAccount
) =>
  fromAccountChangeEvent<AccountInfo<Buffer>>(
    connection,
    tokenAccount.pubkey
  ).pipe(
    map((account) => TokenAccountParser(tokenAccount.pubkey, account)),
    startWith(tokenAccount)
  );

export const observeUserAccounts =
  (connection: Connection) =>
  (source: Observable<TokenAccount[]>): Observable<TokenAccount[]> =>
    source.pipe(
      switchMap(([nativeAccount, ...tokenAccounts]) =>
        combineLatest([
          fromNativeAccountChangeEvent(connection, nativeAccount),
          ...tokenAccounts.map((tokenAccount) =>
            fromTokenAccountChangeEvent(connection, tokenAccount)
          ),
        ])
      )
    );
