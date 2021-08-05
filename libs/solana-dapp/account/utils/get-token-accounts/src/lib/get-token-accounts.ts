import { TokenAccountParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/types';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map, reduce } from 'rxjs/operators';

const getAccounts = (
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

export const getTokenAccounts = (
  connection: Connection,
  walletPublicKey: PublicKey
) =>
  getAccounts(connection, walletPublicKey).pipe(
    reduce((tokenAccounts, accounts) => {
      accounts.forEach((account) =>
        tokenAccounts.set(account.pubkey.toBase58(), account)
      );

      return new Map(tokenAccounts);
    }, new Map<string, ParsedAccountBase>())
  );