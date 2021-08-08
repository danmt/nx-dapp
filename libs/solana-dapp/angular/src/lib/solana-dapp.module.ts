import { ModuleWithProviders, NgModule } from '@angular/core';

import {
  SolanaDappConnectionService,
  SolanaDappMarketService,
  SolanaDappNetworkService,
  SolanaDappWalletService,
} from './services';

@NgModule()
export class SolanaDappModule {
  static forRoot(): ModuleWithProviders<SolanaDappModule> {
    return {
      ngModule: SolanaDappModule,
      providers: [
        SolanaDappConnectionService,
        SolanaDappMarketService,
        SolanaDappNetworkService,
        SolanaDappWalletService,
      ],
    };
  }
}
