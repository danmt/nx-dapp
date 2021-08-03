import { InjectionToken } from '@angular/core';
import { TokenDetails } from '@nx-dapp/solana-dapp/market/base';
import { IMarketService, MarketService } from '@nx-dapp/solana-dapp/market/rx';

export const MARKET_SERVICE = new InjectionToken<IMarketService>(
  'market-service'
);

export const marketServiceProvider = (mintTokens: TokenDetails[]) => ({
  provide: MARKET_SERVICE,
  useFactory: () => new MarketService(mintTokens),
});
