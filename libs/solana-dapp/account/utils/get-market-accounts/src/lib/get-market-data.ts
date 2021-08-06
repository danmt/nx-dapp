import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { MarketData } from '@nx-dapp/solana-dapp/account/types';
import {
  getMarketAccount,
  getMintAccounts,
  getOrderbookAccounts,
} from '@nx-dapp/solana-dapp/account/utils/generics';
import { Connection, PublicKey } from '@solana/web3.js';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import {
  getMarketMintAddresses,
  getMarketOrderbookAddresses,
} from './operations';
import { observeOrderbookAccounts } from './operators';

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
