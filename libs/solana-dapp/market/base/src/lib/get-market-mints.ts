import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import {
  getMultipleAccounts,
  MintParser,
  ParsedAccountBase,
} from '@nx-dapp/solana-dapp/account/base';
import { Connection, PublicKey } from '@solana/web3.js';
import { defer, forkJoin, from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { SerumMarket } from './types';

const getMarketMintAccounts = (
  connection: Connection,
  market: SerumMarket,
  marketAccounts: Map<string, ParsedAccountBase>
): Observable<ParsedAccountBase[]> => {
  const marketAccount = marketAccounts.get(
    market.marketInfo.address.toBase58()
  );

  if (!marketAccount) {
    return of([]);
  }

  return from(
    defer(() =>
      getMultipleAccounts(
        connection,
        [
          marketAccount.info.baseMint.toBase58(),
          marketAccount.info.quoteMint.toBase58(),
        ],
        'single'
      )
    )
  ).pipe(
    isNotNull,
    map(({ array: marketMintAccounts, keys: marketMintAddresses }) =>
      marketMintAccounts.map((marketMintAccount, index) =>
        MintParser(new PublicKey(marketMintAddresses[index]), marketMintAccount)
      )
    )
  );
};

export const getMarketMints = (
  marketByMint: Map<string, SerumMarket>,
  connection: Connection,
  marketAccounts: Map<string, ParsedAccountBase>
): Observable<ParsedAccountBase[]> =>
  forkJoin(
    [...marketByMint.values()].map((market) =>
      getMarketMintAccounts(connection, market, marketAccounts)
    )
  ).pipe(
    map((marketMintAccounts) =>
      marketMintAccounts.reduce(
        (marketMintAccounts, accounts) => [...marketMintAccounts, ...accounts],
        []
      )
    )
  );
