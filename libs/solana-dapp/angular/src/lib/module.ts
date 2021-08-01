import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { accountServiceProvider } from '@nx-dapp/solana-dapp/account/angular';
import { balanceServiceProvider } from '@nx-dapp/solana-dapp/balance/angular';
import { connectionServiceProvider } from '@nx-dapp/solana-dapp/connection/angular';
import { marketServiceProvider } from '@nx-dapp/solana-dapp/market/angular';
import { walletServiceProvider } from '@nx-dapp/solana-dapp/wallet/angular';
import { Wallet } from '@nx-dapp/solana-dapp/wallet/base';

export interface SolanaDappConfig {
  isAccountEnabled?: boolean;
  isBalanceEnabled?: boolean;
  isConnectionEnabled?: boolean;
  isMarketEnabled?: boolean;
  isWalletEnabled?: boolean;
  wallets?: Wallet[];
}

export const SOLANA_DAPP_DEFAULT_CONFIG: SolanaDappConfig = {
  isAccountEnabled: true,
  isBalanceEnabled: true,
  isConnectionEnabled: true,
  isMarketEnabled: true,
  isWalletEnabled: true,
  wallets: [],
};

@NgModule({
  imports: [CommonModule],
})
export class SolanaDappModule {
  static forRoot(
    config = SOLANA_DAPP_DEFAULT_CONFIG
  ): ModuleWithProviders<SolanaDappModule> {
    const providers = [];
    config = {
      ...SOLANA_DAPP_DEFAULT_CONFIG,
      ...config,
    };

    if (config.isAccountEnabled) {
      providers.push(accountServiceProvider());
    }

    if (config.isBalanceEnabled) {
      providers.push(balanceServiceProvider());
    }

    if (config.isConnectionEnabled) {
      providers.push(connectionServiceProvider());
    }

    if (config.isMarketEnabled) {
      providers.push(marketServiceProvider());
    }

    if (config.isWalletEnabled && config.wallets) {
      providers.push(walletServiceProvider(config.wallets));
    }

    return {
      ngModule: SolanaDappModule,
      providers: providers,
    };
  }
}
