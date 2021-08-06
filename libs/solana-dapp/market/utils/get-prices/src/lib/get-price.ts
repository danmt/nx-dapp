import { getMarketData, getMintAccount } from '@nx-dapp/solana-dapp/account';
import { GetPriceConfig, TokenPrice } from '@nx-dapp/solana-dapp/market/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { getMarketAddress } from './operations';
import { mapToPrice } from './operators';

export const getPrice = (
  config: GetPriceConfig
): Observable<TokenPrice | null> => {
  const connection = new Connection(config.rpcEndpoint, 'recent');
  const marketConnection = new Connection(config.marketRpcEndpoint, 'recent');
  const walletPublicKey = new PublicKey(config.walletPublicKey);

  return getMintAccount(connection, walletPublicKey).pipe(
    switchMap((mintAccount) => {
      if (!mintAccount) {
        return of(null);
      }

      const marketAddress = getMarketAddress(mintAccount);

      if (!marketAddress) {
        return of(null);
      }

      return getMarketData(marketConnection, new PublicKey(marketAddress)).pipe(
        mapToPrice(mintAccount)
      );
    })
  );
};
