import {
  getMultipleAccounts,
  OrderBookParser,
  ParsedAccountBase,
} from '@nx-dapp/solana-dapp/account/base';
import { Connection, PublicKey } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map, mergeMap, reduce } from 'rxjs/operators';

const getAccounts = (
  connection: Connection,
  marketAccount: ParsedAccountBase
): Observable<ParsedAccountBase[]> => {
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

export const getMarketIndicatorAccounts = (
  connection: Connection,
  marketAccounts: Map<string, ParsedAccountBase>
): Observable<Map<string, ParsedAccountBase>> =>
  from(marketAccounts.values()).pipe(
    mergeMap((marketAccount) => getAccounts(connection, marketAccount)),
    reduce((marketIndicatorAccounts, accounts) => {
      accounts.forEach((account) =>
        marketIndicatorAccounts.set(account.pubkey.toBase58(), account)
      );

      return new Map(marketIndicatorAccounts);
    }, new Map<string, ParsedAccountBase>())
  );
