import {
  ENV as ChainID,
  TokenInfo,
  TokenListProvider,
} from '@solana/spl-token-registry';
import { defer, from } from 'rxjs';
import { map } from 'rxjs/operators';

export const getTokens = (chainID: ChainID) => {
  return from(
    defer(() => new TokenListProvider().resolve()).pipe(
      map((tokenListContainer) =>
        tokenListContainer
          .filterByChainId(chainID)
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
