import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import {
  getMultipleAccounts,
  OrderBookParser,
  ParsedAccountBase,
} from '@nx-dapp/solana-dapp/account/base';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { defer, from, Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { SerumMarket } from './types';

const getMarketIndicatorAccounts = (
  connection: Connection,
  market: SerumMarket,
  marketAccounts: Map<string, ParsedAccountBase>
): Observable<{ keys: string[]; array: AccountInfo<Buffer>[] } | null> => {
  const marketAccount = marketAccounts.get(
    market.marketInfo.address.toBase58()
  );

  if (!marketAccount) {
    return of(null);
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
  );
};

export const getMarketIndicators = (
  marketByMint: Map<string, SerumMarket>,
  connection: Connection,
  marketAccounts: Map<string, ParsedAccountBase>
): Observable<Map<string, ParsedAccountBase>> =>
  from([...marketByMint.values()]).pipe(
    concatMap((market) =>
      getMarketIndicatorAccounts(connection, market, marketAccounts).pipe(
        isNotNull,
        map(
          ({
            array: marketIndicatorAccounts,
            keys: marketIndicatorAddresses,
          }) =>
            marketIndicatorAccounts
              .map((marketIndicatorAccount, index) =>
                OrderBookParser(
                  new PublicKey(marketIndicatorAddresses[index]),
                  marketIndicatorAccount
                )
              )
              .reduce(
                (marketAccounts, marketAccount) =>
                  marketAccounts.set(
                    marketAccount.pubkey.toBase58(),
                    marketAccount
                  ),
                new Map<string, ParsedAccountBase>()
              )
        )
      )
    )
  );
