import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import {
  DexMarketParser,
  getMultipleAccounts,
  ParsedAccountBase,
} from '@nx-dapp/solana/account-adapter/base';
import { Connection } from '@solana/web3.js';
import { defer, from } from 'rxjs';
import { map } from 'rxjs/operators';

import { SerumMarket } from './types';

export const getMarkets = (
  marketByMint: Map<string, SerumMarket>,
  connection: Connection
) =>
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
    map(({ array: marketAccounts }) =>
      marketAccounts
        .map((marketAccount) => {
          const mintAddress = [...marketByMint.keys()].find((mint) =>
            marketByMint.get(mint)
          );

          if (!mintAddress) {
            return null;
          }

          const market = marketByMint.get(mintAddress);

          if (!market) {
            return null;
          }

          return DexMarketParser(market.marketInfo.address, marketAccount);
        })
        .filter((market): market is ParsedAccountBase => market !== null)
    )
  );
