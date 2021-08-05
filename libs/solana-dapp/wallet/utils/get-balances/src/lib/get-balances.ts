import {
  getMintAccounts,
  getUserAccounts,
  observeUserAccounts,
} from '@nx-dapp/solana-dapp/account/utils/get-user-accounts';
import { Balance, GetBalancesConfig } from '@nx-dapp/solana-dapp/wallet/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToBalances } from './operators';

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
