import { Network } from '@nx-dapp/solana-dapp/connection/types';
import { TokenInfo, TokenListProvider } from '@solana/spl-token-registry';
import { defer, from } from 'rxjs';
import { map } from 'rxjs/operators';

export const getTokens = (network: Network) => {
  return from(
    defer(() => new TokenListProvider().resolve()).pipe(
      map((tokenListContainer) =>
        tokenListContainer
          .filterByChainId(network.chainID)
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
