import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import {
  DexMarketParser,
  getMultipleAccounts,
  ParsedAccountBase,
} from '@nx-dapp/solana-dapp/account/base';
import { Connection, PublicKey } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SerumMarket } from './types';

export const getMarkets = (
  marketByMint: Map<string, SerumMarket>,
  connection: Connection
): Observable<Map<string, ParsedAccountBase>> =>
  from(
    defer(() =>
      getMultipleAccounts(
        connection,
        [...marketByMint.values()].map((market) =>
          market.marketInfo.address.toBase58()
        ),
        'single'
      )
    )
  ).pipe(
    isNotNull,
    map(({ array: marketAccounts, keys: marketAccountAddresses }) =>
      marketAccounts
        .map((marketAccount, index) => {
          const mintAddress = [...marketByMint.keys()].find((mint) =>
            marketByMint.get(mint)
          );

          if (!mintAddress) {
            return null;
          }

          const marketAddress = marketAccountAddresses[index];

          if (!marketAddress) {
            return null;
          }

          return DexMarketParser(new PublicKey(marketAddress), marketAccount);
        })
        .filter((market): market is ParsedAccountBase => market !== null)
        .reduce(
          (marketAccounts, marketAccount) =>
            marketAccounts.set(marketAccount.pubkey.toBase58(), marketAccount),
          new Map<string, ParsedAccountBase>()
        )
    )
  );
