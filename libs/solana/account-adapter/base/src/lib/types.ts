import { AccountInfo as TokenAccountInfo } from '@solana/spl-token';
import { AccountInfo, PublicKey } from '@solana/web3.js';

export interface TokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
  info: TokenAccountInfo;
}
