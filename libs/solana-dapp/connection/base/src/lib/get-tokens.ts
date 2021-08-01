import { TokenInfo, TokenListProvider } from '@solana/spl-token-registry';
import { defer, from } from 'rxjs';
import { map } from 'rxjs/operators';

import { Endpoint } from './types';

export const getTokens = (endpoint: Endpoint) => {
  return from(
    defer(() => new TokenListProvider().resolve()).pipe(
      map((tokenListContainer) =>
        tokenListContainer
          .filterByChainId(endpoint.chainID)
          .excludeByTag('nft')
          .getList()
          .reduce(
            (tokenMap, token) => tokenMap.set(token.address, token),
            new Map<string, TokenInfo>()
          )
      )
    )
  );
};
