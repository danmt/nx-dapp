import { Connection, PublicKey } from '@solana/web3.js';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToBalances, observeUserAccounts } from './operators';
import { Balance } from './types';
import { getMintAccounts, getNativeAccount, getTokenAccounts } from './utils';

export const getBalances = (
  rpcEndpoint: string,
  walletPublicKey: string
): Observable<Balance[]> =>
  of(new Connection(rpcEndpoint, 'recent')).pipe(
    switchMap((connection) =>
      forkJoin([
        getNativeAccount(connection, new PublicKey(walletPublicKey)),
        getTokenAccounts(connection, new PublicKey(walletPublicKey)),
      ]).pipe(
        observeUserAccounts(connection),
        switchMap((userAccounts) =>
          getMintAccounts(connection, userAccounts).pipe(
            mapToBalances(userAccounts)
          )
        )
      )
    )
  );
