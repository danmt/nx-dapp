import { InjectionToken } from '@angular/core';
import { IMarketService, MarketService } from '@nx-dapp/solana-dapp/market/rx';

export const MARKET_SERVICE = new InjectionToken<IMarketService>(
  'market-service'
);

export const marketServiceProvider = () => ({
  provide: MARKET_SERVICE,
  useFactory: () => new MarketService(),
});