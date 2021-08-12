import { ModuleWithProviders, NgModule } from '@angular/core';

import {
  SolanaDappBalanceService,
  SolanaDappConnectionService,
  SolanaDappMarketService,
  SolanaDappNetworkService,
  SolanaDappTransactionService,
  SolanaDappWalletService,
} from './services';

@NgModule()
export class SolanaDappModule {
  static forRoot(): ModuleWithProviders<SolanaDappModule> {
    return {
      ngModule: SolanaDappModule,
      providers: [
        SolanaDappBalanceService,
        SolanaDappConnectionService,
        SolanaDappMarketService,
        SolanaDappNetworkService,
        SolanaDappWalletService,
        SolanaDappTransactionService,
      ],
    };
  }
}
