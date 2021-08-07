import { getMarketsData, getMintAccounts } from '@nx-dapp/solana-dapp/account';
import { Connection } from '@solana/web3.js';
import { switchMap } from 'rxjs/operators';

import { mapToPrices } from './operators';
import { GetPricesConfig } from './types';
import { getMarketAddresses } from './utils';

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
    )
  );
};
