import { ModuleWithProviders, NgModule } from '@angular/core';
import { Network } from '@nx-dapp/solana-dapp/connection/base';
import { TokenDetails } from '@nx-dapp/solana-dapp/types';

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
