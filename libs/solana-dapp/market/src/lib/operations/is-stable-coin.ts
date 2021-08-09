import { TOKEN_MINTS } from '@project-serum/serum';
import { PublicKey } from '@solana/web3.js';

const STABLE_COINS = new Set(['USDC', 'wUSDC', 'USDT']);

export const isStableCoin = (pubkey: PublicKey) => {
  const SERUM_TOKEN = TOKEN_MINTS.find((tokenMint) =>
    tokenMint.address.equals(pubkey)
  );

  return STABLE_COINS.has(SERUM_TOKEN?.name || '');
};
