import { MarketsData, MintTokenAccount } from '@nx-dapp/solana-dapp/account';
import { TokenPrice } from '@nx-dapp/solana-dapp/utils/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { isStableCoin } from '../operations';
import { getTokenPriceByMint } from '../utils';

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
