import { isNotNull } from '@nx-dapp/shared/utils/operators';
import {
  OrderbookAccount,
  OrderBookParser,
} from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { from, Observable } from 'rxjs';
import { concatMap, map, toArray } from 'rxjs/operators';

import { getMultipleAccounts } from '..';

export const getOrderbookAccounts = (
  connection: Connection,
  orderbookAddresses: string[]
): Observable<OrderbookAccount[]> =>
  getMultipleAccounts(connection, orderbookAddresses, 'single').pipe(
    concatMap(({ array: orderbookAccounts, keys: orderbookAccountAddresses }) =>
      from(orderbookAccounts).pipe(
        isNotNull,
        map((orderbookAccount, index) =>
          OrderBookParser(
            new PublicKey(orderbookAccountAddresses[index]),
            orderbookAccount
          )
        ),
        toArray()
      )
    )
  );
