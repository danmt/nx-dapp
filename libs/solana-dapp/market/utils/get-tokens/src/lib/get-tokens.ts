import {
  ENV as ChainID,
  TokenInfo,
  TokenListProvider,
} from '@solana/spl-token-registry';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const getTokens = (chainID: ChainID): Observable<TokenInfo[]> =>
  from(
    defer(() => new TokenListProvider().resolve()).pipe(
      map((tokenListContainer) =>
        tokenListContainer
          .filterByChainId(chainID)
          .excludeByTag('nft')
          .getList()
      )
    )
  );
