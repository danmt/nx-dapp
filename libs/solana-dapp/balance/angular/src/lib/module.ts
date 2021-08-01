import { ModuleWithProviders, NgModule } from '@angular/core';
import { TokenDetails } from '@nx-dapp/solana-dapp/balance/base';

import { balanceServiceProvider } from './provider';

@NgModule({})
export class BalanceModule {
  static forRoot(
    mintTokens: TokenDetails[]
  ): ModuleWithProviders<BalanceModule> {
    return {
      ngModule: BalanceModule,
      providers: [balanceServiceProvider(mintTokens)],
    };
  }
}
