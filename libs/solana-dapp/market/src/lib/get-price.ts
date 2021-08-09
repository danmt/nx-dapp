import { getMarketData, getMintAccount } from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

import { mapToPrice } from './operators';
import { GetPriceConfig, TokenPrice } from './types';
import { getMarketByBaseMint } from './utils';

const DEBOUNCE_TIME_IN_MS = 1_000;

export const getPrice = (
  config: GetPriceConfig
): Observable<TokenPrice | null> => {
  const connection =
    config.connection instanceof Connection
      ? config.connection
      : new Connection(config.connection, 'recent');
  const marketConnection =
    config.marketConnection instanceof Connection
      ? config.marketConnection
      : new Connection(config.marketConnection, 'recent');
  const mintPublicKey = new PublicKey(config.mintAddress);

  return getMintAccount(connection, mintPublicKey).pipe(
    switchMap((mintAccount) => {
      if (!mintAccount) {
        return of(null);
      }

      const market = getMarketByBaseMint(mintAccount.pubkey.toBase58());

      if (!market) {
        return of(null);
      }

      return getMarketData(
        marketConnection,
        new PublicKey(market.address)
      ).pipe(mapToPrice(mintAccount));
    }),
    debounceTime(DEBOUNCE_TIME_IN_MS)
  );
};
