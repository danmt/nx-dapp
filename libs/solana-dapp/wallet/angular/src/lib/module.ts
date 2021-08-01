import { ModuleWithProviders, NgModule } from '@angular/core';
import { Wallet, WalletName } from '@nx-dapp/solana-dapp/wallet/base';

import { walletServiceProvider } from './provider';

@NgModule({})
export class WalletModule {
  static forRoot(
    wallets: Wallet[],
    defaultWallet: WalletName
  ): ModuleWithProviders<WalletModule> {
    return {
      ngModule: WalletModule,
      providers: [walletServiceProvider(wallets, defaultWallet)],
    };
  }
}
