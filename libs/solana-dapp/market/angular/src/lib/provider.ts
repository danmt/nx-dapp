import { InjectionToken } from '@angular/core';
import {
  IMarketService,
  MarketService,
  Network,
  TokenDetails,
} from '@nx-dapp/solana-dapp/market/rx';

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
