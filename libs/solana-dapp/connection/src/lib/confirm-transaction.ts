import { Connection } from '@solana/web3.js';
import { defer, from } from 'rxjs';

export const confirmTransaction = (connection: Connection, txId: string) =>
  from(defer(() => connection.confirmTransaction(txId)));
