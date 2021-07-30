import { NATIVE_MINT, u64 } from '@solana/spl-token';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { TokenAccount } from './types';

export const wrapNativeToken = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): TokenAccount => ({
  pubkey: publicKey,
  account,
  info: {
    address: publicKey,
    mint: NATIVE_MINT,
    owner: publicKey,
    amount: new u64(account.lamports),
    delegate: null,
    delegatedAmount: new u64(0),
    isInitialized: true,
    isFrozen: false,
    isNative: true,
    rentExemptReserve: null,
    closeAuthority: null,
  },
});
