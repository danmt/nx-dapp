import { MarketData, MintTokenAccount } from '@nx-dapp/solana-dapp/account';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { createTokenPrice } from '../operations';
import { TokenPrice } from '../types';

export const mapToPrice =
  (mintAccount: MintTokenAccount) =>
  (source: Observable<MarketData>): Observable<TokenPrice | null> =>
    source.pipe(
      map(({ account, mintAccounts: marketMintAccounts, orderbookAccounts }) =>
        createTokenPrice(
          mintAccount,
          account,
          marketMintAccounts,
          orderbookAccounts
        )
      )
    );
