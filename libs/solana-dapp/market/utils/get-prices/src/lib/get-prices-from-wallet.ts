import {
  getMarketsData,
  getMintAccounts,
  getUserAccountMints,
  getUserAccounts,
} from '@nx-dapp/solana-dapp/account';
import {
  GetPricesFromWalletConfig,
  TokenPrice,
} from '@nx-dapp/solana-dapp/market/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { getMarketAddresses } from './operations';
import { mapToPrices } from './operators';

export const getPricesFromWallet = (
  config: GetPricesFromWalletConfig
): Observable<TokenPrice[]> => {
  const connection = new Connection(config.rpcEndpoint, 'recent');
  const marketConnection = new Connection(config.marketRpcEndpoint, 'recent');
  const walletPublicKey = new PublicKey(config.walletPublicKey);

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
