import {
  getMarketsData,
  getMintAccounts,
  getUserAccountMints,
  getUserAccounts,
} from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToPrices } from './operators';
import { GetPricesFromWalletConfig, TokenPrice } from './types';
import { getMarketAddresses } from './utils';

export const getPricesFromWallet = (
  config: GetPricesFromWalletConfig
): Observable<TokenPrice[]> => {
  const connection = new Connection(config.rpcEndpoint, 'recent');
  const marketConnection = new Connection(config.marketRpcEndpoint, 'recent');
  const walletPublicKey = new PublicKey(config.walletAddress);

  return getUserAccounts(connection, walletPublicKey).pipe(
    switchMap((userAccounts) =>
      getMintAccounts(connection, getUserAccountMints(userAccounts))
    ),
    switchMap((mintAccounts) =>
      getMarketsData(marketConnection, getMarketAddresses(mintAccounts)).pipe(
        mapToPrices(mintAccounts)
      )
    )
  );
};
