import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { fromAccountChangeEvent } from '@nx-dapp/solana-dapp/account/utils/from-account-change';
import { TokenAccountParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Connection } from '@solana/web3.js';
import { combineLatest, Observable } from 'rxjs';
import { concatMap, map, startWith, switchMap } from 'rxjs/operators';

import { getNativeAccount } from '../utils';

export const observeUserAccounts =
  (connection: Connection) =>
  (
    source: Observable<[TokenAccount, TokenAccount[]]>
  ): Observable<TokenAccount[]> =>
    source.pipe(
      switchMap(([nativeAccount, tokenAccounts]) =>
        combineLatest([
          fromAccountChangeEvent(connection, nativeAccount.pubkey).pipe(
            concatMap(() => getNativeAccount(connection, nativeAccount.pubkey))
          ),
          ...tokenAccounts.map((tokenAccount) =>
            fromAccountChangeEvent(connection, tokenAccount.pubkey).pipe(
              map((account) => TokenAccountParser(tokenAccount.pubkey, account))
            )
          ),
        ]).pipe(startWith([nativeAccount, ...tokenAccounts]))
      )
    );
