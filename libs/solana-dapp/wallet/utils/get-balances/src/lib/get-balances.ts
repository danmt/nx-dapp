import { Connection, PublicKey } from '@solana/web3.js';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToBalances, observeUserAccounts } from './operators';
import { Balance, GetBalancesConfig } from './types';
import { getMintAccounts, getNativeAccount, getTokenAccounts } from './utils';

export const getBalances = (config: GetBalancesConfig): Observable<Balance[]> =>
  of(new Connection(config.rpcEndpoint, 'recent')).pipe(
    switchMap((connection) =>
      forkJoin([
        getNativeAccount(connection, new PublicKey(config.walletPublicKey)),
        getTokenAccounts(connection, new PublicKey(config.walletPublicKey)),
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
