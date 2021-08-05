import {
  MarketAccount,
  MintTokenAccount,
  OrderbookAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { forkJoin, Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { mapToMarketAccounts } from '../operators';
import { getMarketIndicatorAccounts } from './get-market-indicator-accounts';
import { getMarketMintAccounts } from './get-market-mint-accounts';
import { getMintAccounts } from './get-mint-accounts';
import { getUserAccounts } from './get-user-accounts';

export const getMarketAccounts = (
  walletConnection: Connection,
  marketConnection: Connection,
  walletPublicKey: PublicKey
): Observable<{
  mintAccounts: MintTokenAccount[];
  marketAccounts: MarketAccount[];
  marketMintAccounts: MintTokenAccount[];
  marketIndicatorAccounts: OrderbookAccount[];
}> =>
  getUserAccounts(walletConnection, walletPublicKey).pipe(
    concatMap((userAccounts) =>
      getMintAccounts(walletConnection, userAccounts).pipe(
        mapToMarketAccounts(marketConnection),
        concatMap(({ mintAccounts, marketAccounts }) =>
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
      )
    )
  );
