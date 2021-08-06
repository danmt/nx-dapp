import {
  getMintAccounts,
  getUserAccountMints,
  getUserAccounts,
} from '@nx-dapp/solana-dapp/account';
import {
  Balance,
  GetBalancesFromWalletConfig,
} from '@nx-dapp/solana-dapp/wallet/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { mapToBalances } from './operators';

export const getBalancesFromWallet = (
  config: GetBalancesFromWalletConfig
): Observable<Balance[]> => {
  const walletPublicKey = new PublicKey(config.walletAddress);
  const connection = new Connection(config.rpcEndpoint, 'recent');

  return getUserAccounts(connection, walletPublicKey).pipe(
    switchMap((userAccounts) =>
      getMintAccounts(connection, getUserAccountMints(userAccounts)).pipe(
        mapToBalances(userAccounts)
      )
    )
  );
};
