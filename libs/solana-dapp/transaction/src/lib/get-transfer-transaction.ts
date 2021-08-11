import { getBlockHash } from '@nx-dapp/solana-dapp/connection';
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction as Web3Transaction,
} from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { Transaction, TransferConfig } from './types';

export const getTransferTransaction = (
  config: TransferConfig
): Observable<Transaction> => {
  const connection =
    config.connection instanceof Connection
      ? config.connection
      : new Connection(config.connection, 'recent');
  const walletPublicKey = new PublicKey(config.walletAddress);
  const recipientPublicKey = new PublicKey(config.recipientAddress);
  const amount = config.amount;

  return getBlockHash(connection).pipe(
    map(({ blockhash }) => ({
      id: uuid(),
      data: new Web3Transaction({
        recentBlockhash: blockhash,
        feePayer: walletPublicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: walletPublicKey,
          toPubkey: recipientPublicKey,
          lamports: LAMPORTS_PER_SOL * amount || 0,
        })
      ),
    }))
  );
};
