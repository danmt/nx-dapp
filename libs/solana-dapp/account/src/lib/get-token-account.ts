import { TokenAccount, TokenAccountParser } from '@nx-dapp/solana-dapp/account';
import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { getAccount } from '..';

export const getTokenAccount = (
  connection: Connection,
  pubkey: PublicKey,
  commitment?: Commitment
): Observable<TokenAccount | null> =>
  getAccount(connection, pubkey, commitment || 'recent').pipe(
    map(
      (tokenAccount) => tokenAccount && TokenAccountParser(pubkey, tokenAccount)
    )
  );
