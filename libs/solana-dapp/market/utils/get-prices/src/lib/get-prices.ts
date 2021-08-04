import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { Connection } from '@solana/web3.js';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { TokenPrice } from './types';
import {
  getMarketAccounts,
  getMarketMintAccounts,
  getMintAccounts,
  mapToPrices,
} from './utils';
import { getMarketIndicatorAccounts } from './utils/get-market-indicator-accounts';

export const getPrices = (
  rpcEndpoint: string,
  userAccounts: TokenAccount[]
): Observable<TokenPrice[]> =>
  of(new Connection(rpcEndpoint, 'recent')).pipe(
    switchMap((connection) =>
      getMintAccounts(connection, userAccounts).pipe(
        switchMap((mintAccounts) =>
          getMarketAccounts(connection, mintAccounts).pipe(
            switchMap((marketAccounts) =>
              forkJoin([
                getMarketMintAccounts(connection, marketAccounts),
                getMarketIndicatorAccounts(connection, marketAccounts),
              ]).pipe(mapToPrices(mintAccounts, marketAccounts))
            )
          )
        )
      )
    )
  );
