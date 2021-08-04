import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { calculateMidPrice } from '../operations';
import { TokenPrice } from '../types';

const createPrice = (
  marketAccount: ParsedAccountBase,
  mintAccounts: ParsedAccountBase[],
  marketMintAccounts: ParsedAccountBase[],
  marketIndicatorAccounts: ParsedAccountBase[]
): TokenPrice | null => {
  const mintAccount = mintAccounts.find(
    (mintAccount) =>
      mintAccount.pubkey.toBase58() === marketAccount.info.baseMint.toBase58()
  );

  if (!mintAccount) {
    return null;
  }

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

export const mapToPrices =
  (mintAccounts: ParsedAccountBase[], marketAccounts: ParsedAccountBase[]) =>
  (
    source: Observable<[ParsedAccountBase[], ParsedAccountBase[]]>
  ): Observable<TokenPrice[]> =>
    source.pipe(
      map(([marketMintAccounts, marketIndicatorAccounts]) =>
        marketAccounts
          .map((marketAccount) =>
            createPrice(
              marketAccount,
              mintAccounts,
              marketMintAccounts,
              marketIndicatorAccounts
            )
          )
          .filter((price): price is TokenPrice => price !== null)
      )
    );
