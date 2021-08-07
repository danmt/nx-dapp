import {
  getMintAccounts,
  getUserAccountMints,
  getUserAccounts,
} from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToBalances } from './operators';
import { Balance, GetBalancesFromWalletConfig } from './types';

export const getBalancesFromWallet = (
  config: GetBalancesFromWalletConfig
): Observable<Balance[]> => {
  const connection =
    config.connection instanceof Connection
      ? config.connection
      : new Connection(config.connection, 'recent');
  const walletPublicKey = new PublicKey(config.walletAddress);

  return getUserAccounts(connection, walletPublicKey).pipe(
    switchMap((userAccounts) =>
      getMintAccounts(connection, getUserAccountMints(userAccounts)).pipe(
        mapToBalances(userAccounts)
      )
    )
  );
};
