import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import {
  getMultipleAccounts,
  OrderBookParser,
  ParsedAccountBase,
} from '@nx-dapp/solana-dapp/account/base';
import { Connection, PublicKey } from '@solana/web3.js';
import { defer, forkJoin, from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { SerumMarket } from './types';

const getMarketIndicatorAccounts = (
  connection: Connection,
  market: SerumMarket,
  marketAccounts: Map<string, ParsedAccountBase>
): Observable<ParsedAccountBase[]> => {
  const marketAccount = marketAccounts.get(
    market.marketInfo.address.toBase58()
  );

  if (!marketAccount) {
    return of([]);
  }

  return from(
    defer(() =>
      getMultipleAccounts(
        connection,
        [
          marketAccount.info.asks.toBase58(),
          marketAccount.info.bids.toBase58(),
        ],
        'single'
      )
    )
  ).pipe(
    isNotNull,
    map(({ array: marketIndicatorAccounts, keys: marketIndicatorAddresses }) =>
      marketIndicatorAccounts.map((marketIndicatorAccount, index) =>
        OrderBookParser(
          new PublicKey(marketIndicatorAddresses[index]),
          marketIndicatorAccount
        )
      )
    )
  );
};

export const getMarketIndicators = (
  marketByMint: Map<string, SerumMarket>,
  connection: Connection,
  marketAccounts: Map<string, ParsedAccountBase>
): Observable<ParsedAccountBase[]> =>
  forkJoin(
    [...marketByMint.values()].map((market) =>
      getMarketIndicatorAccounts(connection, market, marketAccounts)
    )
  ).pipe(
    map((marketIndicatorAccounts) =>
      marketIndicatorAccounts.reduce(
        (marketIndicatorAccounts, accounts) => [
          ...marketIndicatorAccounts,
          ...accounts,
        ],
        []
      )
    )
  );
