import { ModuleWithProviders, NgModule } from '@angular/core';

import { balanceServiceProvider } from './provider';

@NgModule({})
export class BalanceModule {
  static forRoot(): ModuleWithProviders<BalanceModule> {
    return {
      ngModule: BalanceModule,
      providers: [balanceServiceProvider()],
    };
  }
}
