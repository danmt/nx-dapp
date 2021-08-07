import { getMarketData, getMintAccount } from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { getMarketByBaseMint } from './operations';
import { mapToPrice } from './operators';
import { GetPriceConfig, TokenPrice } from './types';

export const getPrice = (
  config: GetPriceConfig
): Observable<TokenPrice | null> => {
  const connection = new Connection(config.rpcEndpoint, 'recent');
  const marketConnection = new Connection(config.marketRpcEndpoint, 'recent');
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
    })
  );
};
