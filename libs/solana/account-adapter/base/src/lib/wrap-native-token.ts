import { u64 } from '@nx-dapp/solana/utils/u64';
import { NATIVE_MINT } from '@solana/spl-token';
import { AccountInfo, PublicKey } from '@solana/web3.js';

import { TokenAccount } from './types';

export const wrapNativeAccount = (
  pubkey: PublicKey,
  account: AccountInfo<Buffer>
): TokenAccount => {
  return {
    pubkey: pubkey,
    account,
    info: {
      address: pubkey,
      mint: NATIVE_MINT,
      owner: pubkey,
      amount: new u64(account.lamports),
      delegate: null,
      delegatedAmount: new u64(0),
      isInitialized: true,
      isFrozen: false,
      isNative: true,
      rentExemptReserve: null,
      closeAuthority: null,
    },
  };
};
