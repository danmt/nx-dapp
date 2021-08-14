import {
  Connection,
  PublicKey,
  Transaction as Web3Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { encodeTokenInstructionData } from './encode-token-instruction-data';
import { getBlockHash } from '@nx-dapp/solana-dapp/connection';
import { map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

export interface SplTransferConfig {
  connection: Connection;
  walletAddress: string;
  emitterAddress: string;
  recipientAddress: string;
  mintAddress: string;
  amount: number;
  decimals: number;
}

export const getSplTransferTransaction = (config: SplTransferConfig) => {
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
      data: new Web3Transaction({
        recentBlockhash: blockhash,
        feePayer: walletPublicKey,
      }).add(
        new TransactionInstruction({
          keys: [
            {
              pubkey: emitterPublicKey,
              isSigner: false,
              isWritable: true,
            },
            {
              pubkey: mintPublicKey,
              isSigner: false,
              isWritable: false,
            },
            {
              pubkey: recipientPublicKey,
              isSigner: false,
              isWritable: true,
            },
            {
              pubkey: walletPublicKey,
              isSigner: true,
              isWritable: false,
            },
          ],
          data: encodeTokenInstructionData({
            transferChecked: {
              amount: config.amount,
              decimals: config.decimals,
            },
          }),
          programId: TOKEN_PROGRAM_ID,
        })
      ),
    }))
  );
};
