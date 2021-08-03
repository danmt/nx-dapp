import { InjectionToken } from '@angular/core';
import { Network } from '@nx-dapp/solana-dapp/connection/base';
import { IMarketService, MarketService } from '@nx-dapp/solana-dapp/market/rx';
import { TokenDetails } from '@nx-dapp/solana-dapp/types';

export const MARKET_SERVICE = new InjectionToken<IMarketService>(
  'market-service'
);

export const marketServiceProvider = (
  network: Network,
  mintTokens: TokenDetails[]
) => ({
  provide: MARKET_SERVICE,
  useFactory: () => new MarketService(network, mintTokens),
});
