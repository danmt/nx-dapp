import {
  getMintAccount,
  getMintAccounts,
} from '@nx-dapp/solana-dapp/account/utils/generics';
import { getUserAccounts } from '@nx-dapp/solana-dapp/account/utils/get-user-accounts';
import {
  Balance,
  GetBalanceConfig,
  GetBalancesConfig,
  GetBalancesFromWalletConfig,
} from '@nx-dapp/solana-dapp/wallet/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { calculateMints } from './operations';
import { mapToBalance, mapToBalances } from './operators';

export const getBalancesFromWallet = (
  config: GetBalancesFromWalletConfig
): Observable<Balance[]> => {
  const walletPublicKey = new PublicKey(config.walletAddress);
  const connection = new Connection(config.rpcEndpoint, 'recent');

  return getUserAccounts(connection, walletPublicKey).pipe(
    switchMap((userAccounts) =>
      getMintAccounts(connection, calculateMints(userAccounts)).pipe(
        mapToBalances(userAccounts)
      )
    )
  );
};

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
