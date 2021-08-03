import {
  OrderBookParser,
  ParsedAccountBase,
} from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { from, Observable } from 'rxjs';
import { map, mergeMap, reduce } from 'rxjs/operators';

import { getMultipleAccounts } from './get-multiple-accounts';

const getAccounts = (
  connection: Connection,
  marketAccount: ParsedAccountBase
): Observable<ParsedAccountBase[]> =>
  getMultipleAccounts(
    connection,
    [marketAccount.info.asks.toBase58(), marketAccount.info.bids.toBase58()],
    'single'
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
