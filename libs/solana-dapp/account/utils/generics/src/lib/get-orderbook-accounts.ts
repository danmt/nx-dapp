import { OrderbookAccount } from '@nx-dapp/solana-dapp/account/types';
import { OrderBookParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { getMultipleAccounts } from '..';

export const getOrderbookAccounts = (
  connection: Connection,
  orderbookAddresses: string[]
): Observable<OrderbookAccount[]> =>
  getMultipleAccounts(connection, orderbookAddresses, 'single').pipe(
    map(({ array: orderbookAccounts, keys: orderbookAccountAddresses }) =>
      orderbookAccounts.map((orderbookAccount, index) =>
        OrderBookParser(
          new PublicKey(orderbookAccountAddresses[index]),
          orderbookAccount
        )
      )
    )
  );
