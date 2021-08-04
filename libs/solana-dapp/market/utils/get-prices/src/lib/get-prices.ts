import { Connection } from '@solana/web3.js';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { TokenPrice } from './types';
import { getMarketAccounts, getMarketMintAccounts, mapToPrices } from './utils';
import { getMarketIndicatorAccounts } from './utils/get-market-indicator-accounts';

export const getPrices = (
  rpcEndpoint: string,
  walletPublicKey: string
): Observable<TokenPrice[]> =>
  of(new Connection(rpcEndpoint, 'recent')).pipe(
    switchMap((connection) =>
      getMarketAccounts(connection, walletPublicKey).pipe(
        switchMap(({ marketAccounts, mintAccounts }) =>
          forkJoin([
            getMarketMintAccounts(connection, marketAccounts),
            getMarketIndicatorAccounts(connection, marketAccounts),
          ]).pipe(mapToPrices(mintAccounts, marketAccounts))
        )
      )
    )
  );
