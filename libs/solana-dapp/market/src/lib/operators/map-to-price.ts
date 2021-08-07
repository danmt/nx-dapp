import { MarketData, MintTokenAccount } from '@nx-dapp/solana-dapp/account';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { getTokenPriceByMint } from '../utils';
import { TokenPrice } from '../types';

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
      }))
    );
