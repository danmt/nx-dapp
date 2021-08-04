import { isNotNull } from '@nx-dapp/shared/operators/not-null';
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
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import {
  combineLatest,
  defer,
  forkJoin,
  from,
  fromEventPattern,
  Observable,
  of,
} from 'rxjs';
import { map, mergeMap, startWith } from 'rxjs/operators';

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
  tokenAccounts: ParsedAccountBase[],
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

const mapBalances =
  (connection: Connection) => (source: Observable<TokenAccount[]>) =>
    source.pipe(
      mergeMap((tokenAccounts) =>
        getMultipleAccounts(
          connection,
          [
            ...new Set(
              tokenAccounts.map(({ info }) => info.mint.toBase58())
            ).values(),
          ],
          'recent'
        ).pipe(
          map(({ array: mintAccounts, keys }) =>
            mintAccounts.map((account, index) =>
              createBalance(
                tokenAccounts,
                MintParser(new PublicKey(keys[index]), account)
              )
            )
          )
        )
      )
    );

const fromAccountChangeEvent = (
  connection: Connection,
  account: TokenAccount
) =>
  fromEventPattern<AccountInfo<Buffer>>(
    (addHandler) => connection.onAccountChange(account.pubkey, addHandler),
    (removeHandler, id) =>
      connection.removeAccountChangeListener(id).then(removeHandler)
  ).pipe(isNotNull);

const mapTokenAccount =
  (tokenAccount: TokenAccount) => (source: Observable<AccountInfo<Buffer>>) =>
    source.pipe(
      map((account) => TokenAccountParser(tokenAccount.pubkey, account)),
      startWith(tokenAccount)
    );

const mapNativeAccount =
  (connection: Connection, nativeAccount: TokenAccount) =>
  (source: Observable<AccountInfo<Buffer>>) =>
    source.pipe(
      mergeMap(() => getNativeAccount(connection, nativeAccount.pubkey)),
      startWith(nativeAccount)
    );

const fromTokenAccountChangeEvent = (
  connection: Connection,
  tokenAccounts: TokenAccount[]
) =>
  tokenAccounts.map((tokenAccount) =>
    fromAccountChangeEvent(connection, tokenAccount).pipe(
      mapTokenAccount(tokenAccount)
    )
  );

const fromNativeAccountChangeEvent = (
  connection: Connection,
  nativeAccount: TokenAccount
) => {
  return fromAccountChangeEvent(connection, nativeAccount).pipe(
    mapNativeAccount(connection, nativeAccount)
  );
};

const observeUserAccounts =
  (connection: Connection) =>
  (source: Observable<[TokenAccount, TokenAccount[]]>) =>
    source.pipe(
      mergeMap(([nativeAccount, tokenAccounts]) =>
        combineLatest([
          ...fromTokenAccountChangeEvent(connection, tokenAccounts),
          fromNativeAccountChangeEvent(connection, nativeAccount),
        ])
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
      ]).pipe(observeUserAccounts(connection), mapBalances(connection))
    )
  );
};
