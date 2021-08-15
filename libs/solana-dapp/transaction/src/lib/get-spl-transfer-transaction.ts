import { getBlockHash } from '@nx-dapp/solana-dapp/connection';
import { Transaction } from '@nx-dapp/solana-dapp/utils/types';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Connection,
  PublicKey,
  Transaction as Web3Transaction,
} from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { createTransferCheckedInstruction } from './create-transfer-checked-instruction';

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
    map(({ blockhash }) => ({
      id: uuid(),
      date: new Date(Date.now()),
      data: new Web3Transaction({
        recentBlockhash: blockhash,
        feePayer: walletPublicKey,
      }).add(
        createTransferCheckedInstruction(
          TOKEN_PROGRAM_ID,
          emitterPublicKey,
          mintPublicKey,
          recipientPublicKey,
          walletPublicKey,
          [],
          config.amount,
          config.decimals
        )
      ),
    }))
  );
};
