import {
  MarketAccount,
  OrderbookAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import { OrderBookParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const getMarketIndicatorAddresses = (
  marketAccounts: MarketAccount[]
): string[] => [
  ...new Set(
    marketAccounts.reduce(
      (marketIndicatorAccounts: string[], marketAccount: MarketAccount) => [
        ...marketIndicatorAccounts,
        marketAccount.info.asks.toBase58(),
        marketAccount.info.bids.toBase58(),
      ],
      []
    )
  ).values(),
];

export const getMarketIndicatorAccounts = (
  connection: Connection,
  marketAccounts: MarketAccount[]
): Observable<OrderbookAccount[]> =>
  getMultipleAccounts(
    connection,
    getMarketIndicatorAddresses(marketAccounts),
    'single'
  ).pipe(
    map(({ array: marketIndicatorAccounts, keys: marketIndicatorAddresses }) =>
      marketIndicatorAccounts.map((account, index) =>
        OrderBookParser(new PublicKey(marketIndicatorAddresses[index]), account)
      )
    )
  );
