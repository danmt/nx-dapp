import {
  getAssociatedTokenPublicKey,
  getMintAccount,
  getUserAccounts,
} from '@nx-dapp/solana-dapp/account';
import {
  Balance,
  GetBalanceForWalletConfig,
} from '@nx-dapp/solana-dapp/utils/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { addAssociatedTokenAccountAddress, mapToBalance } from './operators';

export const getBalanceForWallet = (
  config: GetBalanceForWalletConfig
): Observable<Balance | null> => {
  const connection =
    config.connection instanceof Connection
      ? config.connection
      : new Connection(config.connection, 'recent');
  const walletPublicKey = new PublicKey(config.walletAddress);

  return getUserAccounts(connection, walletPublicKey).pipe(
    switchMap((userAccounts) =>
      getMintAccount(connection, userAccounts[0].info.mint).pipe(
        mapToBalance(userAccounts)
      )
    ),
    addAssociatedTokenAccountAddress(walletPublicKey)
  );
};
