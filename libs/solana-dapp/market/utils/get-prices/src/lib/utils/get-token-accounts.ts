import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { TokenAccountParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const getTokenAccounts = (
  connection: Connection,
  walletPublicKey: PublicKey
): Observable<TokenAccount[]> =>
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
