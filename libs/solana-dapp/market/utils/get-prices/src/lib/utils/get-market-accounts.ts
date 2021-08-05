import {
  MarketAccount,
  MintTokenAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { forkJoin, Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { mapToMarketAccounts } from '../operators';

import { getMintAccounts } from './get-mint-accounts';
import { getNativeAccount } from './get-native-account';
import { getTokenAccounts } from './get-token-accounts';

export const getMarketAccounts = (
  walletConnection: Connection,
  marketConnection: Connection,
  walletPublicKey: string
): Observable<{
  mintAccounts: MintTokenAccount[];
  marketAccounts: MarketAccount[];
}> =>
  forkJoin([
    getNativeAccount(walletConnection, new PublicKey(walletPublicKey)),
    getTokenAccounts(walletConnection, new PublicKey(walletPublicKey)),
  ]).pipe(
    concatMap(([nativeAccount, tokenAccounts]) =>
      getMintAccounts(walletConnection, [nativeAccount, ...tokenAccounts]).pipe(
        mapToMarketAccounts(marketConnection)
      )
    )
  );
