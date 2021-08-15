import { TransactionPayload } from '@nx-dapp/solana-dapp/utils/types';
import { Connection } from '@solana/web3.js';
import { defer, from } from 'rxjs';

export const sendTransaction = (
  connection: Connection,
  transaction: TransactionPayload
) =>
  from(
    defer(() => connection.sendRawTransaction(transaction.data.serialize()))
  );
