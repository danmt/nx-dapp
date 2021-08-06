import { OrderbookAccount } from '@nx-dapp/solana-dapp/account/types';
import { fromAccountChangeEvent } from '@nx-dapp/solana-dapp/account/utils/generics';
import { OrderBookParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Connection } from '@solana/web3.js';
import { combineLatest, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const observeMarketIndicatorAccounts =
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
