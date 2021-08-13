import { MarketData, MintTokenAccount } from '@nx-dapp/solana-dapp/account';
import { TokenPrice } from '@nx-dapp/solana-dapp/utils/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { isStableCoin } from '../operations';
import { getTokenPriceByMint } from '../utils';

export const mapToPrice =
  (mintAccount: MintTokenAccount) =>
  (source: Observable<MarketData | null>): Observable<TokenPrice> =>
    source.pipe(
      map((marketData) => ({
        address: mintAccount.pubkey.toBase58(),
        price: marketData
          ? getTokenPriceByMint(
              mintAccount,
              marketData.marketAccount,
              marketData.marketMintAccounts,
              marketData.orderbookAccounts
            )
          : 0,
        isStable: isStableCoin(mintAccount.pubkey),
      }))
    );
