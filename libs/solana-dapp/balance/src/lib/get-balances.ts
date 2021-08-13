import { isNotNull } from '@nx-dapp/shared/utils/operators';
import { getMintAccounts, getUserAccounts } from '@nx-dapp/solana-dapp/account';
import { Balance, GetBalancesConfig } from '@nx-dapp/solana-dapp/utils/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { addAssociatedTokenAccountAddress, mapToBalances } from './operators';

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
    ),
    switchMap((balances) =>
      forkJoin(
        balances.map((balance) =>
          of(balance).pipe(
            addAssociatedTokenAccountAddress(walletPublicKey),
            isNotNull
          )
        )
      )
    )
  );
};
