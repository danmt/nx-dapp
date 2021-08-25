import { isNotNull } from '@nx-dapp/shared/utils/operators';
import { MintParser } from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { from, Observable } from 'rxjs';
import { concatMap, map, toArray } from 'rxjs/operators';

import { getMultipleAccounts } from './get-multiple-accounts';
import { MintTokenAccount } from './types';

export const getMintAccounts = (
  connection: Connection,
  mintAddresses: string[]
): Observable<MintTokenAccount[]> =>
  getMultipleAccounts(connection, mintAddresses, 'recent').pipe(
    concatMap(({ array: mintAccounts, keys }) =>
      from(mintAccounts).pipe(
        isNotNull,
        map((account, index) =>
          MintParser(new PublicKey(keys[index]), account)
        ),
        toArray()
      )
    )
  );
