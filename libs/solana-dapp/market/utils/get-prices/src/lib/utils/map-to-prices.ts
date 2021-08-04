import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/types';
import { from, Observable } from 'rxjs';
import { map, reduce, switchMap } from 'rxjs/operators';

import { TokenPrice } from '../types';
import { createPrice } from './create-price';

export const mapToPrices =
  (mintAccounts: ParsedAccountBase[], marketAccounts: ParsedAccountBase[]) =>
  (source: Observable<[ParsedAccountBase[], ParsedAccountBase[]]>) => {
    return source.pipe(
      switchMap(([marketMintAccounts, marketIndicatorAccounts]) =>
        from(mintAccounts).pipe(
          map((mintAccount) =>
            marketAccounts
              .filter(
                (marketAccount) =>
                  marketAccount.info.baseMint.toBase58() ===
                  mintAccount.pubkey.toBase58()
              )
              .map((marketAccount) =>
                createPrice(
                  mintAccount,
                  marketAccount,
                  marketMintAccounts,
                  marketIndicatorAccounts
                )
              )
          )
        )
      ),
      reduce(
        (marketPrices: TokenPrice[], prices: TokenPrice[]) => [
          ...marketPrices,
          ...prices,
        ],
        []
      )
    );
  };
