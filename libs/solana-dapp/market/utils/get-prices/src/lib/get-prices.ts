import { getMarketsData, getMintAccounts } from '@nx-dapp/solana-dapp/account';
import { GetPricesConfig } from '@nx-dapp/solana-dapp/market/types';
import { Connection } from '@solana/web3.js';
import { switchMap } from 'rxjs/operators';

import { getMarketAddresses } from './operations';
import { mapToPrices } from './operators';

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
