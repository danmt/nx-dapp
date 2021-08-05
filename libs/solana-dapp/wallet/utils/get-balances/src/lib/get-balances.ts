import { Balance, GetBalancesConfig } from '@nx-dapp/solana-dapp/wallet/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToBalances, observeUserAccounts } from './operators';
import { getMintAccounts, getUserAccounts } from './utils';

export const getBalances = (config: GetBalancesConfig): Observable<Balance[]> =>
  of(new Connection(config.rpcEndpoint, 'recent')).pipe(
    switchMap((connection) =>
      getUserAccounts(connection, new PublicKey(config.walletPublicKey)).pipe(
        observeUserAccounts(connection),
        switchMap((userAccounts) =>
          getMintAccounts(connection, userAccounts).pipe(
            mapToBalances(userAccounts)
          )
        )
      )
    )
  );
