import { ModuleWithProviders, NgModule } from '@angular/core';
import { TokenDetails } from '@nx-dapp/solana-dapp/market/base';

import { marketServiceProvider } from './provider';

@NgModule({})
export class MarketModule {
  static forRoot(
    mintTokens: TokenDetails[]
  ): ModuleWithProviders<MarketModule> {
    return {
      ngModule: MarketModule,
      providers: [marketServiceProvider(mintTokens)],
    };
  }
}
