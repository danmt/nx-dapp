import { MarketsData } from '@nx-dapp/solana-dapp/account/types';
import {
  getMarketAccounts,
  getMintAccounts,
  getOrderbookAccounts,
} from '@nx-dapp/solana-dapp/account/utils/generics';
import { Connection } from '@solana/web3.js';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { getMarketsMintAddresses } from './operations';
import { getMarketsOrderbookAddresses } from './operations/get-markets-orderbook-addresses';
import { observeOrderbookAccounts } from './operators';

export const getMarketsData = (
  connection: Connection,
  marketAddresses: string[]
): Observable<MarketsData> =>
  getMarketAccounts(connection, marketAddresses).pipe(
    switchMap((marketAccounts) =>
      combineLatest([
        getMintAccounts(connection, getMarketsMintAddresses(marketAccounts)),
        getOrderbookAccounts(
          connection,
          getMarketsOrderbookAddresses(marketAccounts)
        ).pipe(observeOrderbookAccounts(connection)),
      ]).pipe(
        map(([marketMintAccounts, marketIndicatorAccounts]) => ({
          accounts: marketAccounts,
          mintAccounts: marketMintAccounts,
          orderbookAccounts: marketIndicatorAccounts,
        }))
      )
    )
  );
