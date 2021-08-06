import {
  MarketAccounts,
  MintTokenAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { Connection } from '@solana/web3.js';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { getMarketIndicatorAccounts } from './get-market-indicator-accounts';
import { getMarketMintAccounts } from './get-market-mint-accounts';
import { mapToMarketAccounts } from './operators';

export const getMarketAccounts = (
  marketConnection: Connection,
  mintAccounts: MintTokenAccount[]
): Observable<MarketAccounts> =>
  of(mintAccounts).pipe(
    mapToMarketAccounts(marketConnection),
    switchMap((marketAccounts) =>
      combineLatest([
        getMarketMintAccounts(marketConnection, marketAccounts),
        getMarketIndicatorAccounts(marketConnection, marketAccounts),
      ]).pipe(
        map(([marketMintAccounts, marketIndicatorAccounts]) => ({
          accounts: marketAccounts,
          mints: marketMintAccounts,
          indicators: marketIndicatorAccounts,
        }))
      )
    )
  );
