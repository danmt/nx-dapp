import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { defer, from } from 'rxjs';
import { map } from 'rxjs/operators';

export const getMultipleAccounts = (
  connection: Connection,
  keys: string[],
  commitment: Commitment
) =>
  from(
    defer(() =>
      connection.getMultipleAccountsInfo(
        keys.map((key) => new PublicKey(key)),
        commitment
      )
    )
  ).pipe(map((accounts) => ({ array: accounts || [], keys: keys || [] })));
