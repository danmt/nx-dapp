import { getMintAccounts, getUserAccounts } from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToBalances } from './operators';
import { Balance, GetBalancesConfig } from './types';

export const getBalances = (
  config: GetBalancesConfig
): Observable<Balance[]> => {
  const connection =
    config.connection instanceof Connection
      ? config.connection
      : new Connection(config.connection, 'recent');
  const walletPublicKey = new PublicKey(config.walletAddress);

  return getUserAccounts(connection, walletPublicKey).pipe(
    switchMap((userAccounts) =>
      getMintAccounts(connection, config.mintAddresses).pipe(
        mapToBalances(userAccounts)
      )
    )
  );
};
