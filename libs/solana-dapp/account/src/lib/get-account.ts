import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { defer, from } from 'rxjs';

export const getAccount = (
  connection: Connection,
  pubkey: PublicKey,
  commitment: Commitment
) => from(defer(() => connection.getAccountInfo(pubkey, commitment)));
