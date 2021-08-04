import { Connection } from '@solana/web3.js';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { TokenPrice } from './types';
import { getMarketAccounts, getMarketMintAccounts, mapToPrices } from './utils';
import { getMarketIndicatorAccounts } from './utils/get-market-indicator-accounts';

interface GetPricesConfig {
  walletPublicKey: string;
  rpcEndpoint: string;
  marketEndpoint: string;
}

export const getPrices = (config: GetPricesConfig): Observable<TokenPrice[]> =>
  of([
    new Connection(config.rpcEndpoint, 'recent'),
    new Connection(config.marketEndpoint, 'recent'),
  ]).pipe(
    switchMap(([walletConnection, marketConnection]) =>
      getMarketAccounts(
        walletConnection,
        marketConnection,
        config.walletPublicKey
      ).pipe(
        switchMap(({ marketAccounts, mintAccounts }) =>
          forkJoin([
            getMarketMintAccounts(marketConnection, marketAccounts),
            getMarketIndicatorAccounts(marketConnection, marketAccounts),
          ]).pipe(mapToPrices(mintAccounts, marketAccounts))
        )
      )
    )
  );
