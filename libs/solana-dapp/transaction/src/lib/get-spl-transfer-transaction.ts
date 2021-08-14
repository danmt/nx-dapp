import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export interface SplTransferConfig {
  walletAddress: string;
  emitterAddress: string;
  recipientAddress: string;
  mintAddress: string;
  amount: number;
}

export const getSplTransferTransaction = (config: SplTransferConfig) => {
  return new Transaction().add(
    new TransactionInstruction({
      keys: [
        {
          pubkey: new PublicKey(config.emitterAddress),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: new PublicKey(config.mintAddress),
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: new PublicKey(config.recipientAddress),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: new PublicKey(config.walletAddress),
          isSigner: true,
          isWritable: false,
        },
      ],
      data: encodeTokenInstructionData({
        transferChecked: { amount: config.amount, decimals },
      }),
      programId: TOKEN_PROGRAM_ID,
    })
  );
};

function encodeTokenInstructionData(instruction) {
  let b = Buffer.alloc(instructionMaxSpan);
  let span = LAYOUT.encode(instruction, b);
  return b.slice(0, span);
}
