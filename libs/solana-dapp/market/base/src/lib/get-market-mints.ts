import {
  getMultipleAccounts,
  MintParser,
  ParsedAccountBase,
} from '@nx-dapp/solana-dapp/account/base';
import { SerumMarket } from './types';
import { defer, from, Observable, of } from 'rxjs';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';

import { concatMap, map } from 'rxjs/operators';
import { isNotNull } from '@nx-dapp/shared/operators/not-null';

const getMarketMintAccounts = (
  connection: Connection,
  market: SerumMarket,
  marketAccounts: ParsedAccountBase[]
): Observable<{ keys: string[]; array: AccountInfo<Buffer>[] } | null> => {
  const marketAccount = marketAccounts.find(
    (account) =>
      account.pubkey.toBase58() === market.marketInfo.address.toBase58()
  );

  if (!marketAccount) {
    return of(null);
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
  );
};

export const getMarketMints = (
  marketByMint: Map<string, SerumMarket>,
  connection: Connection,
  marketAccounts: ParsedAccountBase[]
): Observable<ParsedAccountBase[]> =>
  from(marketByMint.values()).pipe(
    concatMap((market) =>
      getMarketMintAccounts(connection, market, marketAccounts).pipe(
        isNotNull,
        map(({ array: marketMintAccounts, keys: marketMintAddresses }) =>
          marketMintAccounts.map((marketMintAccount, index) =>
            MintParser(
              new PublicKey(marketMintAddresses[index]),
              marketMintAccount
            )
          )
        )
      )
    )
  );
