import { Connection, PublicKey } from '@solana/web3.js';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToPrices } from './operators';
import { GetPricesConfig, TokenPrice } from './types';
import { getMarketAccounts } from './utils';

export const getPrices = (config: GetPricesConfig): Observable<TokenPrice[]> =>
  of([
    new Connection(config.rpcEndpoint, 'recent'),
    new Connection(config.marketEndpoint, 'recent'),
  ]).pipe(
    switchMap(([walletConnection, marketConnection]) =>
      getMarketAccounts(
        walletConnection,
        marketConnection,
        new PublicKey(config.walletPublicKey)
      ).pipe(mapToPrices)
    )
  );
