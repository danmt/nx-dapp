import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import { getNativeAccount } from '@nx-dapp/solana-dapp/account/utils/get-native-account';
import {
  MintParser,
  TokenAccountParser,
} from '@nx-dapp/solana-dapp/account/utils/serializer';
import { MintInfo, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { defer, forkJoin, from, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

export interface Balance {
  address: string;
  lamports: number;
  quantity: number;
  hasBalance: boolean;
}

const fromLamports = (lamports: number, mint: MintInfo, rate = 1) => {
  const amount = Math.floor(lamports);

  const precision = Math.pow(10, mint?.decimals || 0);
  return (amount / precision) * rate;
};

const createBalance = (
  tokenAccounts: TokenAccount[],
  mintAccount: MintTokenAccount
): Balance => {
  const accounts = tokenAccounts.filter(
    (tokenAccount) =>
      tokenAccount.info.mint.toBase58() === mintAccount.pubkey.toBase58()
  );
  const lamports = accounts.reduce(
    (res, item) => (res += item.info.amount.toNumber()),
    0
  );
  const quantity = fromLamports(lamports, mintAccount.info);

  return {
    address: mintAccount.pubkey.toBase58(),
    lamports,
    quantity,
    hasBalance: quantity > 0 && accounts.length > 0,
  };
};

const getTokenAccounts = (
  connection: Connection,
  walletPublicKey: PublicKey
): Observable<ParsedAccountBase[]> =>
  from(
    defer(() =>
      connection.getTokenAccountsByOwner(walletPublicKey, {
        programId: TOKEN_PROGRAM_ID,
      })
    )
  ).pipe(
    map(({ value }) =>
      value.map(({ pubkey, account }) => TokenAccountParser(pubkey, account))
    )
  );

const getMintAccounts = (
  connection: Connection,
  tokenAccounts: TokenAccount[]
): Observable<ParsedAccountBase[]> =>
  from(
    defer(() =>
      getMultipleAccounts(
        connection,
        [
          ...new Set(
            tokenAccounts.map(({ info }) => info.mint.toBase58())
          ).values(),
        ],
        'recent'
      )
    )
  ).pipe(
    map(({ array: mintAccounts, keys }) =>
      mintAccounts.map((account, index) =>
        MintParser(new PublicKey(keys[index]), account)
      )
    )
  );

export const getBalances = (
  rpcEndpoint: string,
  walletPublicKey: string
): Observable<Balance[]> => {
  return of(new Connection(rpcEndpoint, 'recent')).pipe(
    mergeMap((connection) =>
      forkJoin([
        getNativeAccount(connection, new PublicKey(walletPublicKey)),
        getTokenAccounts(connection, new PublicKey(walletPublicKey)),
      ]).pipe(
        map(([nativeAccount, tokenAccounts]) => [
          nativeAccount,
          ...tokenAccounts,
        ]),
        mergeMap((tokenAccounts) =>
          getMintAccounts(connection, tokenAccounts).pipe(
            map((mintAccounts) =>
              mintAccounts.map((account) =>
                createBalance(tokenAccounts, account)
              )
            )
          )
        )
      )
    )
  );
};
