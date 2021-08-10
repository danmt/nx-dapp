import {
  getMarketsData,
  getMintAccounts,
  getUserAccountMints,
  getUserAccounts,
} from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap, throttleTime } from 'rxjs/operators';

import { mapToPrices } from './operators';
import { GetPricesFromWalletConfig, TokenPrice } from './types';
import { getMarketAddresses } from './utils';

const THROTTLE_TIME_IN_MS = 30_000;

export const getPricesFromWallet = (
  config: GetPricesFromWalletConfig
): Observable<TokenPrice[]> => {
  const connection =
    config.connection instanceof Connection
      ? config.connection
      : new Connection(config.connection, 'recent');
  const marketConnection =
    config.marketConnection instanceof Connection
      ? config.marketConnection
      : new Connection(config.marketConnection, 'recent');
  const walletPublicKey = new PublicKey(config.walletAddress);

  return getUserAccounts(connection, walletPublicKey).pipe(
    switchMap((userAccounts) =>
      getMintAccounts(connection, getUserAccountMints(userAccounts))
    ),
    switchMap((mintAccounts) =>
      getMarketsData(marketConnection, getMarketAddresses(mintAccounts)).pipe(
        mapToPrices(mintAccounts)
      )
    ),
    throttleTime(THROTTLE_TIME_IN_MS)
  );
};
