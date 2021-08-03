import { ModuleWithProviders, NgModule } from '@angular/core';
import { Network, TokenDetails } from '@nx-dapp/solana-dapp/market/rx';

import { marketServiceProvider } from './provider';

@NgModule({})
export class MarketModule {
  static forRoot(
    network: Network,
    mintTokens: TokenDetails[]
  ): ModuleWithProviders<MarketModule> {
    return {
      ngModule: MarketModule,
      providers: [marketServiceProvider(network, mintTokens)],
    };
  }
}
