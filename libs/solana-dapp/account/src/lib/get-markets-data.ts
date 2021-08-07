import { MarketAccount, MarketsData } from '@nx-dapp/solana-dapp/account';
import { Connection } from '@solana/web3.js';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import {
  getMarketAccounts,
  getMarketMintAddresses,
  getMarketOrderbookAddresses,
  getMintAccounts,
  getOrderbookAccounts,
  observeOrderbookAccounts,
} from '..';

const getMarketsMintAddresses = (marketAccounts: MarketAccount[]): string[] => [
  ...new Set(
    marketAccounts.reduce(
      (marketMintAccounts: string[], marketAccount: MarketAccount) => [
        ...marketMintAccounts,
        ...getMarketMintAddresses(marketAccount),
      ],
      []
    )
  ).values(),
];

const getMarketsOrderbookAddresses = (
  marketAccounts: MarketAccount[]
): string[] => [
  ...new Set(
    marketAccounts.reduce(
      (marketMintAccounts: string[], marketAccount: MarketAccount) => [
        ...marketMintAccounts,
        ...getMarketOrderbookAddresses(marketAccount),
      ],
      []
    )
  ).values(),
];

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
        map(([marketMintAccounts, orderbookAccounts]) => ({
          marketAccounts,
          marketMintAccounts,
          orderbookAccounts,
        }))
      )
    )
  );
