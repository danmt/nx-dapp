import { MintInfo } from '@solana/spl-token';

export function fromLamports(
  lamports: number,
  mint: MintInfo,
  rate = 1
): number {
  const amount = Math.floor(lamports);

  const precision = Math.pow(10, mint?.decimals || 0);
  return (amount / precision) * rate;
}
