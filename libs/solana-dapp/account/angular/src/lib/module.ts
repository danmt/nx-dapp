import { ModuleWithProviders, NgModule } from '@angular/core';
import { TokenDetails } from '@nx-dapp/solana-dapp/balance/base';

import { accountServiceProvider } from './provider';

@NgModule({})
export class AccountModule {
  static forRoot(
    mintTokens: TokenDetails[]
  ): ModuleWithProviders<AccountModule> {
    return {
      ngModule: AccountModule,
      providers: [accountServiceProvider(mintTokens)],
    };
  }
}
