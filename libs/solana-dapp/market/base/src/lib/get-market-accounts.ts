import {
  DexMarketParser,
  getMultipleAccounts,
  ParsedAccountBase,
} from '@nx-dapp/solana-dapp/account/base';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SerumMarket } from './types';

export const getMarketAccounts = (
  marketByMint: Map<string, SerumMarket>,
  connection: Connection
): Observable<Map<string, ParsedAccountBase>> =>
  getMultipleAccounts(
    connection,
    [...marketByMint.values()].map((market) =>
      market.marketInfo.address.toBase58()
    ),
    'single'
  ).pipe(
    map(({ array: marketAccounts, keys: marketAccountAddresses }) =>
      marketAccounts
        .map((marketAccount, index) =>
          DexMarketParser(
            new PublicKey(marketAccountAddresses[index]),
            marketAccount
          )
        )
        .reduce(
          (marketAccounts, marketAccount) =>
            marketAccounts.set(marketAccount.pubkey.toBase58(), marketAccount),
          new Map<string, ParsedAccountBase>()
        )
    )
  );
