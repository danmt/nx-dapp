import { DexMarketParser } from '@nx-dapp/solana-dapp/account';
import { Connection, PublicKey } from '@solana/web3.js';
import { map } from 'rxjs/operators';

import { getMultipleAccounts } from '..';

export const getMarketAccounts = (
  connection: Connection,
  marketAddresses: string[]
) =>
  getMultipleAccounts(connection, marketAddresses, 'single').pipe(
    map(({ array: marketAccounts, keys: marketAccountAddresses }) =>
      marketAccounts.map((marketAccount, index) =>
        DexMarketParser(
          new PublicKey(marketAccountAddresses[index]),
          marketAccount
        )
      )
    )
  );
