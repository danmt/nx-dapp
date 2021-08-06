import { getMarketAccounts } from '@nx-dapp/solana-dapp/account/utils/get-market-accounts';
import {
  getMintAccounts,
  getUserAccounts,
} from '@nx-dapp/solana-dapp/account/utils/get-user-accounts';
import { GetPricesConfig, TokenPrice } from '@nx-dapp/solana-dapp/market/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToPrices } from './operators';

export const getPrices = (
  config: GetPricesConfig
): Observable<TokenPrice[]> => {
  const connection = new Connection(config.rpcEndpoint, 'recent');
  const marketConnection = new Connection(config.marketRpcEndpoint, 'recent');
  const walletPublicKey = new PublicKey(config.walletPublicKey);

  return getUserAccounts(connection, walletPublicKey).pipe(
    switchMap((userAccounts) => getMintAccounts(connection, userAccounts)),
    switchMap((mintAccounts) =>
      getMarketAccounts(marketConnection, mintAccounts).pipe(
        mapToPrices(mintAccounts)
      )
    )
  );
};
