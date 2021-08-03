import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import { MintParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/types';
import { Connection, PublicKey } from '@solana/web3.js';
import { from, Observable } from 'rxjs';
import { map, mergeMap, reduce } from 'rxjs/operators';

const getAccounts = (
  connection: Connection,
  marketAccount: ParsedAccountBase
): Observable<ParsedAccountBase[]> =>
  getMultipleAccounts(
    connection,
    [
      marketAccount.info.baseMint.toBase58(),
      marketAccount.info.quoteMint.toBase58(),
    ],
    'single'
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

      return new Map(marketMintAccounts);
    }, new Map<string, ParsedAccountBase>())
  );
