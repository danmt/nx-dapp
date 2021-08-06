import {
  MarketAccount,
  MintTokenAccount,
  OrderbookAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { Connection } from '@solana/web3.js';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { getMarketIndicatorAccounts } from './get-market-indicator-accounts';
import { getMarketMintAccounts } from './get-market-mint-accounts';
import { mapToMarketAccounts } from './operators';

export const getMarketAccounts = (
  marketConnection: Connection,
  mintAccounts: MintTokenAccount[]
): Observable<{
  mintAccounts: MintTokenAccount[];
  marketAccounts: MarketAccount[];
  marketMintAccounts: MintTokenAccount[];
  marketIndicatorAccounts: OrderbookAccount[];
}> =>
  of(mintAccounts).pipe(
    mapToMarketAccounts(marketConnection),
    switchMap((marketAccounts) =>
      forkJoin([
        getMarketMintAccounts(marketConnection, marketAccounts),
        getMarketIndicatorAccounts(marketConnection, marketAccounts),
      ]).pipe(
        map(([marketMintAccounts, marketIndicatorAccounts]) => ({
          mintAccounts,
          marketAccounts,
          marketMintAccounts,
          marketIndicatorAccounts,
        }))
      )
    )
  );
