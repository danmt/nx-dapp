import {
  MarketAccount,
  MintTokenAccount,
  OrderbookAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { fromAccountChangeEvent } from '@nx-dapp/solana-dapp/account/utils/from-account-change';
import { OrderBookParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { AccountInfo, Connection } from '@solana/web3.js';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

const fromMarketIndicatorAccountChangedEvent = (
  connection: Connection,
  marketIndicatorAccount: OrderbookAccount
) =>
  fromAccountChangeEvent<[AccountInfo<Buffer>, { slot: number }]>(
    connection,
    marketIndicatorAccount.pubkey
  ).pipe(
    map(([changedAccount]) =>
      OrderBookParser(marketIndicatorAccount.pubkey, changedAccount)
    ),
    startWith(marketIndicatorAccount)
  );

export const observeMarketAccounts =
  (connection: Connection) =>
  (
    source: Observable<{
      mintAccounts: MintTokenAccount[];
      marketAccounts: MarketAccount[];
      marketMintAccounts: MintTokenAccount[];
      marketIndicatorAccounts: OrderbookAccount[];
    }>
  ): Observable<{
    mintAccounts: MintTokenAccount[];
    marketAccounts: MarketAccount[];
    marketMintAccounts: MintTokenAccount[];
    marketIndicatorAccounts: OrderbookAccount[];
  }> =>
    source.pipe(
      switchMap(
        ({
          mintAccounts,
          marketAccounts,
          marketMintAccounts,
          marketIndicatorAccounts,
        }) =>
          combineLatest(
            marketIndicatorAccounts.map((marketIndicatorAccount) =>
              fromMarketIndicatorAccountChangedEvent(
                connection,
                marketIndicatorAccount
              )
            )
          ).pipe(
            map((marketIndicatorAccounts) => ({
              marketAccounts,
              marketMintAccounts,
              marketIndicatorAccounts,
              mintAccounts,
            }))
          )
      )
    );
