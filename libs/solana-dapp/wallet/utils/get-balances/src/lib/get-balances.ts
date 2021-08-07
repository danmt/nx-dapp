import { getMintAccounts, getUserAccounts } from '@nx-dapp/solana-dapp/account';
import { Balance, GetBalancesConfig } from '@nx-dapp/solana-dapp/wallet/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToBalances } from './operators';

export const getBalances = (
  config: GetBalancesConfig
): Observable<Balance[]> => {
  const connection = new Connection(config.rpcEndpoint, 'recent');
  const walletPublicKey = new PublicKey(config.walletAddress);

  return getUserAccounts(connection, walletPublicKey).pipe(
    switchMap((userAccounts) =>
      getMintAccounts(connection, config.mintAddresses).pipe(
        mapToBalances(userAccounts)
      )
    )
  );
};
