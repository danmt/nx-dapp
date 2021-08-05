import { GetPricesConfig, TokenPrice } from '@nx-dapp/solana-dapp/market/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToPrices, observeMarketAccounts } from './operators';
import { getMarketAccounts } from './utils';

export const getPrices = (config: GetPricesConfig): Observable<TokenPrice[]> =>
  of([
    new Connection(config.rpcEndpoint, 'recent'),
    new Connection(config.marketRpcEndpoint, 'recent'),
  ]).pipe(
    switchMap(([walletConnection, marketConnection]) =>
      getMarketAccounts(
        walletConnection,
        marketConnection,
        new PublicKey(config.walletPublicKey)
      ).pipe(observeMarketAccounts(marketConnection), mapToPrices)
    )
  );
