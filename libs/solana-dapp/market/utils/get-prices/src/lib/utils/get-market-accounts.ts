import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/types';
import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import { DexMarketParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Connection, PublicKey } from '@solana/web3.js';
import { map } from 'rxjs/operators';

import { Market } from '../types';
import { getMarket } from './get-market';

export const getMarketAccounts = (
  connection: Connection,
  mintAccounts: ParsedAccountBase[]
) =>
  getMultipleAccounts(
    connection,
    mintAccounts
      .map((mintAddress) => getMarket(mintAddress.pubkey.toBase58()))
      .filter((market): market is Market => market !== null)
      .map((market) => market.address),
    'single'
  ).pipe(
    map(({ array: marketAccounts, keys: marketAccountAddresses }) =>
      marketAccounts.map((marketAccount, index) =>
        DexMarketParser(
          new PublicKey(marketAccountAddresses[index]),
          marketAccount
        )
      )
    )
  );
