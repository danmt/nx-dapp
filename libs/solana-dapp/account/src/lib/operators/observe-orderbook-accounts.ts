import {
  fromAccountChangeEvent,
  OrderbookAccount,
  OrderBookParser,
} from '@nx-dapp/solana-dapp/account';
import { Connection } from '@solana/web3.js';
import { combineLatest, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const observeOrderbookAccounts =
  (connection: Connection) =>
  (source: Observable<OrderbookAccount[]>): Observable<OrderbookAccount[]> =>
    source.pipe(
      switchMap((marketIndicatorAccounts) =>
        combineLatest(
          marketIndicatorAccounts.map((marketIndicatorAccount) =>
            fromAccountChangeEvent(
              connection,
              marketIndicatorAccount,
              (account) =>
                OrderBookParser(marketIndicatorAccount.pubkey, account)
            )
          )
        )
      )
    );
