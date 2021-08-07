import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { MarketData } from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { combineLatest, Observable, of } from 'rxjs';
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
): Observable<MarketData | null> =>
  getMarketAccount(connection, marketPubkey).pipe(
    switchMap((marketAccount) => {
      if (!marketAccount) {
        return of(null);
      }

      return combineLatest([
        getMintAccounts(connection, getMarketMintAddresses(marketAccount)),
        getOrderbookAccounts(
          connection,
          getMarketOrderbookAddresses(marketAccount)
        ).pipe(observeOrderbookAccounts(connection)),
      ]).pipe(
        map(([marketMintAccounts, orderbookAccounts]) => ({
          marketAccount,
          marketMintAccounts,
          orderbookAccounts,
        }))
      );
    })
  );
