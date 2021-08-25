import { isNotNull } from '@nx-dapp/shared/utils/operators';
import { DexMarketParser } from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { from, Observable } from 'rxjs';
import { concatMap, map, toArray } from 'rxjs/operators';

import { getMultipleAccounts } from '..';
import { MarketAccount } from './types';

export const getMarketAccounts = (
  connection: Connection,
  marketAddresses: string[]
): Observable<MarketAccount[]> =>
  getMultipleAccounts(connection, marketAddresses, 'single').pipe(
    concatMap(({ array: marketAccounts, keys: marketAccountAddresses }) =>
      from(marketAccounts).pipe(
        isNotNull,
        map((marketAccount, index) =>
          DexMarketParser(
            new PublicKey(marketAccountAddresses[index]),
            marketAccount
          )
        ),
        toArray()
      )
    )
  );
