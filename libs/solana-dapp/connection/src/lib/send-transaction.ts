import { Connection } from '@solana/web3.js';
import { defer, from } from 'rxjs';
import { Transaction } from '@nx-dapp/solana-dapp/utils/types';

export const sendTransaction = (
  connection: Connection,
  transaction: Transaction
) =>
  from(
    defer(() => connection.sendRawTransaction(transaction.data.serialize()))
  );
