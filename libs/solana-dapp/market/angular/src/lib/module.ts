import { ModuleWithProviders, NgModule } from '@angular/core';

import { marketServiceProvider } from './provider';

@NgModule({})
export class MarketModule {
  static forRoot(): ModuleWithProviders<MarketModule> {
    return {
      ngModule: MarketModule,
      providers: [marketServiceProvider()],
    };
  }
}
