import {
  MarketAccount,
  MintTokenAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import { MintParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Connection, PublicKey } from '@solana/web3.js';
import { from, Observable } from 'rxjs';
import { map, mergeMap, reduce } from 'rxjs/operators';

const getMarketMintAccount = (
  connection: Connection,
  marketAccount: MarketAccount
): Observable<MintTokenAccount> =>
  getMultipleAccounts(
    connection,
    [
      marketAccount.info.baseMint.toBase58(),
      marketAccount.info.quoteMint.toBase58(),
    ],
    'single'
  ).pipe(
    mergeMap(({ array: marketMintAccounts, keys: marketMintAddresses }) =>
      from(marketMintAccounts).pipe(
        map((marketMintAccount, index) =>
          MintParser(
            new PublicKey(marketMintAddresses[index]),
            marketMintAccount
          )
        )
      )
    )
  );

export const getMarketMintAccounts = (
  connection: Connection,
  marketAccounts: MarketAccount[]
): Observable<MintTokenAccount[]> =>
  from(marketAccounts).pipe(
    mergeMap((marketAccount) =>
      getMarketMintAccount(connection, marketAccount)
    ),
    reduce(
      (marketMintAccounts, account) =>
        new Map(marketMintAccounts.set(account.pubkey.toBase58(), account)),
      new Map<string, MintTokenAccount>()
    ),
    map((marketMintAccounts) => [...marketMintAccounts.values()])
  );
