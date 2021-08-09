import { MarketsData, MintTokenAccount } from '@nx-dapp/solana-dapp/account';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { getTokenPriceByMint } from '../utils';
import { TokenPrice } from '../types';
import { isStableCoin } from '../operations';

export const mapToPrices =
  (mintAccounts: MintTokenAccount[]) =>
  (source: Observable<MarketsData>): Observable<TokenPrice[]> =>
    source.pipe(
      map(({ marketAccounts, marketMintAccounts, orderbookAccounts }) =>
        mintAccounts.map((mintAccount) => ({
          address: mintAccount.pubkey.toBase58(),
          price: getTokenPriceByMint(
            mintAccount,
            marketAccounts.find(({ info }) =>
              info.baseMint.equals(mintAccount.pubkey)
            ) || null,
            marketMintAccounts,
            orderbookAccounts
          ),
          isStable: isStableCoin(mintAccount.pubkey),
        }))
      )
    );
