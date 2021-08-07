import { getMintAccount, getUserAccounts } from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToBalance } from './operators';
import { Balance, GetBalanceConfig } from './types';

export const getBalance = (
  config: GetBalanceConfig
): Observable<Balance | null> => {
  const connection =
    config.connection instanceof Connection
      ? config.connection
      : new Connection(config.connection, 'recent');
  const walletPublicKey = new PublicKey(config.walletAddress);
  const mintPubKey = new PublicKey(config.mintAddress);

  return getUserAccounts(connection, walletPublicKey).pipe(
    switchMap((userAccounts) =>
      getMintAccount(connection, mintPubKey).pipe(mapToBalance(userAccounts))
    )
  );
};
