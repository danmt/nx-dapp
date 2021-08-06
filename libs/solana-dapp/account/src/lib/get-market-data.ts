import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { MarketData } from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import {
  getMarketAccount,
  getMarketMintAddresses,
  getMarketOrderbookAddresses,
  getMintAccounts,
  getOrderbookAccounts,
  observeOrderbookAccounts,
} from '..';

export const getMarketData = (
  connection: Connection,
  marketPubkey: PublicKey
): Observable<MarketData> =>
  getMarketAccount(connection, marketPubkey).pipe(
    isNotNull,
    switchMap((marketAccount) =>
      combineLatest([
        getMintAccounts(connection, getMarketMintAddresses(marketAccount)),
        getOrderbookAccounts(
          connection,
          getMarketOrderbookAddresses(marketAccount)
        ).pipe(observeOrderbookAccounts(connection)),
      ]).pipe(
        map(([mintAccounts, orderbookAccounts]) => ({
          account: marketAccount,
          mintAccounts,
          orderbookAccounts,
        }))
      )
    )
  );
