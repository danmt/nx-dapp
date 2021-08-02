import { Connection, PublicKey } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map, reduce } from 'rxjs/operators';

import { getMultipleAccounts } from './get-multiple-accounts';
import { MintParser } from './serializer';
import { MintTokenAccount } from './types';

const getAccounts = (
  connection: Connection,
  marketAddresses: PublicKey[]
): Observable<MintTokenAccount[]> =>
  from(
    defer(() =>
      getMultipleAccounts(
        connection,
        marketAddresses.map((marketAddress) => marketAddress.toBase58()),
        'single'
      )
    )
  ).pipe(
    map(({ array: mintAccounts, keys: mintAddresses }) =>
      mintAccounts.map((mintAccount, index) =>
        MintParser(new PublicKey(mintAddresses[index]), mintAccount)
      )
    )
  );

export const getMintAccounts = (
  connection: Connection,
  mintAddresses: PublicKey[]
): Observable<Map<string, MintTokenAccount>> =>
  getAccounts(connection, mintAddresses).pipe(
    reduce((mintAccounts, accounts) => {
      accounts.forEach((account) =>
        mintAccounts.set(account.pubkey.toBase58(), account)
      );

      return new Map(mintAccounts);
    }, new Map<string, MintTokenAccount>())
  );
