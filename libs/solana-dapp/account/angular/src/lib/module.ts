import { ModuleWithProviders, NgModule } from '@angular/core';

import { accountServiceProvider } from './provider';

@NgModule({})
export class AccountModule {
  static forRoot(): ModuleWithProviders<AccountModule> {
    return {
      ngModule: AccountModule,
      providers: [accountServiceProvider()],
    };
  }
}
