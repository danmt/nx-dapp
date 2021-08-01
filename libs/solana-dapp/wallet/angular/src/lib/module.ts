import { ModuleWithProviders, NgModule } from '@angular/core';
import { Wallet } from '@nx-dapp/solana-dapp/wallet/base';

import { walletServiceProvider } from './provider';

@NgModule({})
export class WalletModule {
  static forRoot(wallets: Wallet[]): ModuleWithProviders<WalletModule> {
    return {
      ngModule: WalletModule,
      providers: [walletServiceProvider(wallets)],
    };
  }
}
