// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./buffer-layout.d.ts" />
import * as BufferLayout from 'buffer-layout';

import { u64 } from '@solana/spl-token';
import { PublicKey, Signer, TransactionInstruction } from '@solana/web3.js';

/**
 * Layout for a 64bit unsigned value
 */
const uint64 = (property = 'uint64'): unknown => {
  return BufferLayout.blob(8, property);
};

/*
This function is temporal, there's already a function that does it
in the @solana/spl-token library but it doesn't expose it.
*/
export const createTransferCheckedInstruction = (
  programId: PublicKey,
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  multiSigners: Array<Signer>,
  amount: number | u64,
  decimals: number
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    uint64('amount'),
    BufferLayout.u8('decimals'),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: 12, // TransferChecked instruction
      amount: new u64(amount).toBuffer(),
      decimals,
    },
    data
  );

  const keys = [
    { pubkey: source, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: destination, isSigner: false, isWritable: true },
  ];
  if (multiSigners.length === 0) {
    keys.push({
      pubkey: owner,
      isSigner: true,
      isWritable: false,
    });
  } else {
    keys.push({ pubkey: owner, isSigner: false, isWritable: false });
    multiSigners.forEach((signer) =>
      keys.push({
        pubkey: signer.publicKey,
        isSigner: true,
        isWritable: false,
      })
    );
  }
  return new TransactionInstruction({
    keys,
    programId: programId,
    data,
  });
};
