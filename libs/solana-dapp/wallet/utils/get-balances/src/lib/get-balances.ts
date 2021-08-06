import {
  getMintAccounts,
  getUserAccounts,
} from '@nx-dapp/solana-dapp/account/utils/get-user-accounts';
import { Balance, GetBalancesConfig } from '@nx-dapp/solana-dapp/wallet/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToBalances } from './operators';

export const getBalances = (
  config: GetBalancesConfig
): Observable<Balance[]> => {
  const walletPublicKey = new PublicKey(config.walletPublicKey);
  const connection = new Connection(config.rpcEndpoint, 'recent');

  return getUserAccounts(connection, walletPublicKey).pipe(
    switchMap((userAccounts) =>
      getMintAccounts(connection, userAccounts).pipe(
        mapToBalances(userAccounts)
      )
    )
  );
};
