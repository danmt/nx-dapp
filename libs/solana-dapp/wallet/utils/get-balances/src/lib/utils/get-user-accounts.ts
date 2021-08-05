import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getNativeAccount } from './get-native-account';
import { getTokenAccounts } from './get-token-accounts';

export const getUserAccounts = (
  connection: Connection,
  walletPublicKey: PublicKey
): Observable<TokenAccount[]> => {
  return forkJoin([
    getNativeAccount(connection, walletPublicKey),
    getTokenAccounts(connection, walletPublicKey),
  ]).pipe(
    map(([nativeAccount, tokenAccounts]) => [nativeAccount, ...tokenAccounts])
  );
};
