// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='./buffer-layout.d.ts' />
import { SystemInstruction } from '@solana/web3.js';
import * as BufferLayout from 'buffer-layout';

export const LAYOUT = BufferLayout.union(BufferLayout.u8('instruction'));
LAYOUT.addVariant(
  0,
  BufferLayout.struct([
    BufferLayout.u8('decimals'),
    BufferLayout.blob(32, 'mintAuthority'),
    BufferLayout.u8('freezeAuthorityOption'),
    BufferLayout.blob(32, 'freezeAuthority'),
  ]),
  'initializeMint'
);
LAYOUT.addVariant(1, BufferLayout.struct([]), 'initializeAccount');
LAYOUT.addVariant(
  7,
  BufferLayout.struct([BufferLayout.nu64('amount')]),
  'mintTo'
);
LAYOUT.addVariant(
  8,
  BufferLayout.struct([BufferLayout.nu64('amount')]),
  'burn'
);
LAYOUT.addVariant(9, BufferLayout.struct([]), 'closeAccount');
LAYOUT.addVariant(
  12,
  BufferLayout.struct([
    BufferLayout.nu64('amount'),
    BufferLayout.u8('decimals'),
  ]),
  'transferChecked'
);

const instructionMaxSpan = Math.max(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...Object.values(LAYOUT.registry).map((r: any) => r.span)
);

export function encodeTokenInstructionData(instruction: SystemInstruction) {
  const buffer = Buffer.alloc(instructionMaxSpan);
  const span = LAYOUT.encode(instruction, buffer);
  return buffer.slice(0, span);
}
