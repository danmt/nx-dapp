import {
  MarketAccount,
  MintTokenAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { mapToMarketAccounts } from '../operators';
import { getMintAccounts } from './get-mint-accounts';
import { getUserAccounts } from './get-user-accounts';

export const getMarketAccounts = (
  walletConnection: Connection,
  marketConnection: Connection,
  walletPublicKey: PublicKey
): Observable<{
  mintAccounts: MintTokenAccount[];
  marketAccounts: MarketAccount[];
}> =>
  getUserAccounts(walletConnection, walletPublicKey).pipe(
    concatMap((userAccounts) =>
      getMintAccounts(walletConnection, userAccounts).pipe(
        mapToMarketAccounts(marketConnection)
      )
    )
  );
