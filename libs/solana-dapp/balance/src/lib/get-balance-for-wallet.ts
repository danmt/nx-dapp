import { getMintAccount, getUserAccounts } from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToBalance } from './operators';
import { Balance, GetBalanceForWalletConfig } from './types';

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
    )
  );
};