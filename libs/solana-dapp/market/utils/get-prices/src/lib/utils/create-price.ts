import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/types';

import { calculateMidPrice } from '../operations';
import { TokenPrice } from '../types';

export const createPrice = (
  mintAccount: ParsedAccountBase,
  marketAccount: ParsedAccountBase,
  marketMintAccounts: ParsedAccountBase[],
  marketIndicatorAccounts: ParsedAccountBase[]
): TokenPrice => {
  return {
    address: mintAccount.pubkey.toBase58(),
    price: calculateMidPrice(
      marketAccount,
      mintAccount.pubkey.toBase58(),
      marketMintAccounts,
      marketIndicatorAccounts
    ),
  };
};
