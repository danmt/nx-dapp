import { Connection } from '@solana/web3.js';
import { defer, from } from 'rxjs';

export const getBlockHash = (connection: Connection) =>
  from(defer(() => connection.getRecentBlockhash()));
