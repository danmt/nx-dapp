import { getBlockHash } from '@nx-dapp/solana-dapp/connection';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SplTransferConfig {
  connection: Connection;
  walletAddress: string;
  emitterAddress: string;
  recipientAddress: string;
  mintAddress: string;
  amount: number;
  decimals: number;
}

export const getSplTransferTransaction = (
  config: SplTransferConfig
): Observable<Transaction> => {
  const connection =
    config.connection instanceof Connection
      ? config.connection
      : new Connection(config.connection, 'recent');
  const walletPublicKey = new PublicKey(config.walletAddress);
  const emitterPublicKey = new PublicKey(config.emitterAddress);
  const recipientPublicKey = new PublicKey(config.recipientAddress);
  const mintPublicKey = new PublicKey(config.mintAddress);

  return getBlockHash(connection).pipe(
    map(({ blockhash }) =>
      new Transaction({
        recentBlockhash: blockhash,
        feePayer: walletPublicKey,
      }).add(
        Token.createTransferCheckedInstruction(
          TOKEN_PROGRAM_ID,
          emitterPublicKey,
          mintPublicKey,
          recipientPublicKey,
          walletPublicKey,
          [],
          Math.round(config.amount * 10 ** config.decimals),
          config.decimals
        )
      )
    )
  );
};
