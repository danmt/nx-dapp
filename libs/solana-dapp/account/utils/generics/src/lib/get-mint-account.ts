import { MintTokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { MintParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getAccount } from '..';

export const getMintAccount = (
  connection: Connection,
  pubkey: PublicKey,
  commitment?: Commitment
): Observable<MintTokenAccount | null> =>
  getAccount(connection, pubkey, commitment || 'recent').pipe(
    map((mintAccount) => mintAccount && MintParser(pubkey, mintAccount))
  );
