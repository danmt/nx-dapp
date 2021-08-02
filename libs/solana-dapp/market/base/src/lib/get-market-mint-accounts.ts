import {
  getMultipleAccounts,
  MintParser,
  ParsedAccountBase,
} from '@nx-dapp/solana-dapp/account/base';
import { Connection, PublicKey } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map, mergeMap, reduce } from 'rxjs/operators';

const getAccounts = (
  connection: Connection,
  marketAccount: ParsedAccountBase
): Observable<ParsedAccountBase[]> =>
  from(
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
    map(({ array: marketMintAccounts, keys: marketMintAddresses }) =>
      marketMintAccounts.map((marketMintAccount, index) =>
        MintParser(new PublicKey(marketMintAddresses[index]), marketMintAccount)
      )
    )
  );

export const getMarketMintAccounts = (
  connection: Connection,
  marketAccounts: Map<string, ParsedAccountBase>
): Observable<Map<string, ParsedAccountBase>> =>
  from(marketAccounts.values()).pipe(
    mergeMap((marketAccount) => getAccounts(connection, marketAccount)),
    reduce((marketMintAccounts, accounts) => {
      accounts.forEach((account) =>
        marketMintAccounts.set(account.pubkey.toBase58(), account)
      );

      return marketMintAccounts;
    }, new Map<string, ParsedAccountBase>())
  );
