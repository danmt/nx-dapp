import { MarketsData, MintTokenAccount } from '@nx-dapp/solana-dapp/account';
import { TokenPrice } from '@nx-dapp/solana-dapp/market/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { createTokenPrice } from '../operations';

export const mapToPrices =
  (mintAccounts: MintTokenAccount[]) =>
  (source: Observable<MarketsData>): Observable<TokenPrice[]> =>
    source.pipe(
      map(
        ({
          accounts: marketAccounts,
          mintAccounts: marketMintAccounts,
          orderbookAccounts,
        }) =>
          mintAccounts
            .map((mintAccount) => {
              const marketAccount = marketAccounts.find(({ info }) =>
                info.baseMint.equals(mintAccount.pubkey)
              );

              if (!marketAccount) {
                return null;
              }

              return createTokenPrice(
                mintAccount,
                marketAccount,
                marketMintAccounts,
                orderbookAccounts
              );
            })
            .filter((price): price is TokenPrice => price !== null)
      )
    );
