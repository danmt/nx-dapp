import { TokenAccount, TokenAccountParser } from '@nx-dapp/solana-dapp/account';
import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { getAccount } from '..';

export const getTokenAccount = (
  connection: Connection,
  publicKey: PublicKey,
  commitment?: Commitment
): Observable<TokenAccount | null> =>
  getAccount(connection, publicKey, commitment || 'recent').pipe(
    map(
      (tokenAccount) =>
        tokenAccount && TokenAccountParser(publicKey, tokenAccount)
    )
  );
