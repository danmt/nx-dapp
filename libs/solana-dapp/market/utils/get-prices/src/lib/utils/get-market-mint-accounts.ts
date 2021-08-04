import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/types';
import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import { MintParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Connection, PublicKey } from '@solana/web3.js';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const getMarketMintAccount = (
  connection: Connection,
  marketAccount: ParsedAccountBase
) =>
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
  marketAccounts: ParsedAccountBase[]
): Observable<ParsedAccountBase[]> =>
  forkJoin(
    marketAccounts.map((marketAccount) =>
      getMarketMintAccount(connection, marketAccount)
    )
  ).pipe(
    map((marketMintAccountsList) => [
      ...marketMintAccountsList
        .reduce((marketMintAccounts, accounts) => {
          accounts.forEach((account) => {
            marketMintAccounts.set(account.pubkey.toBase58(), account);
          });

          return new Map<string, ParsedAccountBase>(marketMintAccounts);
        }, new Map<string, ParsedAccountBase>())
        .values(),
    ])
  );
