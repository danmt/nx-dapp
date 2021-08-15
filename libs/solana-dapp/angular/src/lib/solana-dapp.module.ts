import { ModuleWithProviders, NgModule } from '@angular/core';

import {
  SolanaDappAccountService,
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
        SolanaDappAccountService,
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
