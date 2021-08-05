import {
  MarketAccount,
  MintTokenAccount,
  OrderbookAccount,
} from '@nx-dapp/solana-dapp/account/types';
import {
  getMintAccounts,
  getUserAccounts,
} from '@nx-dapp/solana-dapp/account/utils/get-user-accounts';
import { Connection, PublicKey } from '@solana/web3.js';
import { forkJoin, Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { getMarketIndicatorAccounts } from './get-market-indicator-accounts';
import { getMarketMintAccounts } from './get-market-mint-accounts';
import { mapToMarketAccounts } from './operators';

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
