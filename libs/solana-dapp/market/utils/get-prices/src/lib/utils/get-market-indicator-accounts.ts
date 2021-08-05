import {
  MarketAccount,
  OrderbookAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import { OrderBookParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Connection, PublicKey } from '@solana/web3.js';
import { from, Observable } from 'rxjs';
import { map, mergeMap, reduce } from 'rxjs/operators';

const getMarketIndicatorAccount = (
  connection: Connection,
  marketAccount: MarketAccount
): Observable<OrderbookAccount> =>
  getMultipleAccounts(
    connection,
    [marketAccount.info.asks.toBase58(), marketAccount.info.bids.toBase58()],
    'single'
  ).pipe(
    mergeMap(
      ({ array: marketIndicatorAccounts, keys: marketIndicatorAddresses }) =>
        from(marketIndicatorAccounts).pipe(
          map((marketIndicatorAccount, index) =>
            OrderBookParser(
              new PublicKey(marketIndicatorAddresses[index]),
              marketIndicatorAccount
            )
          )
        )
    )
  );

export const getMarketIndicatorAccounts = (
  connection: Connection,
  marketAccounts: MarketAccount[]
): Observable<OrderbookAccount[]> =>
  from(marketAccounts).pipe(
    mergeMap((marketAccount) =>
      getMarketIndicatorAccount(connection, marketAccount)
    ),
    reduce(
      (marketIndicatorAccounts, account) =>
        new Map(
          marketIndicatorAccounts.set(account.pubkey.toBase58(), account)
        ),
      new Map<string, OrderbookAccount>()
    ),
    map((marketIndicatorAccounts) => [...marketIndicatorAccounts.values()])
  );
