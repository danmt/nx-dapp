import { getBlockHash } from '@nx-dapp/solana-dapp/connection';
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface NativeTransferConfig {
  connection: string | Connection;
  walletAddress: string;
  recipientAddress: string;
  amount: number;
}

export const getNativeTransferTransaction = (
  config: NativeTransferConfig
): Observable<Transaction> => {
  const connection =
    config.connection instanceof Connection
      ? config.connection
      : new Connection(config.connection, 'recent');
  const walletPublicKey = new PublicKey(config.walletAddress);
  const recipientPublicKey = new PublicKey(config.recipientAddress);
  const amount = config.amount;

  return getBlockHash(connection).pipe(
    map(({ blockhash }) =>
      new Transaction({
        recentBlockhash: blockhash,
        feePayer: walletPublicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: walletPublicKey,
          toPubkey: recipientPublicKey,
          lamports: LAMPORTS_PER_SOL * amount || 0,
        })
      )
    )
  );
};
