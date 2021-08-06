import { getMarketsData, getMintAccounts } from '@nx-dapp/solana-dapp/account';
import { Connection } from '@solana/web3.js';
import { switchMap } from 'rxjs/operators';

import { getMarketAddresses } from './operations';
import { mapToPrices } from './operators';
import { GetPricesConfig } from './types';

export const getPrices = (config: GetPricesConfig) => {
  const connection = new Connection(config.rpcEndpoint, 'recent');
  const marketConnection = new Connection(config.marketRpcEndpoint, 'recent');

  return getMintAccounts(connection, config.mintAddresses).pipe(
    switchMap((mintAccounts) =>
      getMarketsData(marketConnection, getMarketAddresses(mintAccounts)).pipe(
        mapToPrices(mintAccounts)
      )
    )
  );
};
