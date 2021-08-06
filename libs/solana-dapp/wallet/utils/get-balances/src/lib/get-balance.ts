import { getMintAccount, getUserAccounts } from '@nx-dapp/solana-dapp/account';
import { Balance, GetBalanceConfig } from '@nx-dapp/solana-dapp/wallet/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToBalance } from './operators';

export const getBalance = (
  config: GetBalanceConfig
): Observable<Balance | null> => {
  const connection = new Connection(config.rpcEndpoint, 'recent');
  const mintPubKey = new PublicKey(config.mintAddress);
  const walletPublicKey = new PublicKey(config.walletAddress);

  return getUserAccounts(connection, walletPublicKey).pipe(
    switchMap((userAccounts) =>
      getMintAccount(connection, mintPubKey).pipe(mapToBalance(userAccounts))
    )
  );
};
