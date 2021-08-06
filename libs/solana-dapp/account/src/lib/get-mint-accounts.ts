import { MintParser } from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { map } from 'rxjs/operators';

import { getMultipleAccounts } from './get-multiple-accounts';

export const getMintAccounts = (
  connection: Connection,
  mintAddresses: string[]
) =>
  getMultipleAccounts(connection, mintAddresses, 'recent').pipe(
    map(({ array: mintAccounts, keys }) =>
      mintAccounts.map((account, index) =>
        MintParser(new PublicKey(keys[index]), account)
      )
    )
  );
