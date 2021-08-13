import { Connection, PublicKey } from '@solana/web3.js';
import { concatMap } from 'rxjs/operators';

import { getAssociatedTokenPublicKey } from './get-associated-token-public-key';
import { getTokenAccount } from './get-token-account';

export const getAssociatedTokenAccount = (
  connection: Connection,
  walletPubkey: PublicKey,
  mintPubkey: PublicKey
) =>
  getAssociatedTokenPublicKey(walletPubkey, mintPubkey).pipe(
    concatMap((associatedTokenPublicKey) =>
      getTokenAccount(connection, associatedTokenPublicKey)
    )
  );
