import { getMarketsData, getMintAccounts } from '@nx-dapp/solana-dapp/account';
import { GetPricesConfig } from '@nx-dapp/solana-dapp/utils/types';
import { Connection } from '@solana/web3.js';
import { switchMap, throttleTime } from 'rxjs/operators';

import { mapToPrices } from './operators';
import { getMarketAddresses } from './utils';

const THROTTLE_TIME_IN_MS = 30_000;

export const getPrices = (config: GetPricesConfig) => {
  const connection =
    config.connection instanceof Connection
      ? config.connection
      : new Connection(config.connection, 'recent');
  const marketConnection =
    config.marketConnection instanceof Connection
      ? config.marketConnection
      : new Connection(config.marketConnection, 'recent');

  return getMintAccounts(connection, config.mintAddresses).pipe(
    switchMap((mintAccounts) =>
      getMarketsData(marketConnection, getMarketAddresses(mintAccounts)).pipe(
        mapToPrices(mintAccounts)
      )
    ),
    throttleTime(THROTTLE_TIME_IN_MS)
  );
};
