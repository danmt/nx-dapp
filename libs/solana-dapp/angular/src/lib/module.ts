import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { accountServiceProvider } from '@nx-dapp/solana-dapp/account/angular';
import { balanceServiceProvider } from '@nx-dapp/solana-dapp/balance/angular';
import { connectionServiceProvider } from '@nx-dapp/solana-dapp/connection/angular';
import { DEFAULT_NETWORK, Network } from '@nx-dapp/solana-dapp/connection/base';
import { marketServiceProvider } from '@nx-dapp/solana-dapp/market/angular';
import { TokenDetails } from '@nx-dapp/solana-dapp/market/base';
import { walletServiceProvider } from '@nx-dapp/solana-dapp/wallet/angular';
import {
  DEFAULT_WALLET,
  Wallet,
  WalletName,
} from '@nx-dapp/solana-dapp/wallet/base';

export interface SolanaDappAccountConfig {
  isEnabled: boolean;
}

export interface SolanaDappBalanceConfig {
  isEnabled: boolean;
}

export interface SolanaDappConnectionConfig {
  isEnabled: boolean;
}

export interface SolanaDappMarketConfig {
  isEnabled: boolean;
}

export interface SolanaDappWalletConfig {
  isEnabled: boolean;
  wallets: Wallet[];
  defaultWallet: WalletName;
}

export interface SolanaDappConfig {
  accountConfig?: SolanaDappAccountConfig;
  balanceConfig?: SolanaDappBalanceConfig;
  connectionConfig?: SolanaDappConnectionConfig;
  marketConfig?: SolanaDappMarketConfig;
  walletConfig?: SolanaDappWalletConfig;
  mintTokens?: TokenDetails[];
  networks?: Network[];
  defaultNetwork?: string;
}

export const SOLANA_DAPP_DEFAULT_CONFIG: SolanaDappConfig = {
  accountConfig: {
    isEnabled: true,
  },
  balanceConfig: {
    isEnabled: true,
  },
  connectionConfig: {
    isEnabled: true,
  },
  marketConfig: {
    isEnabled: true,
  },
  walletConfig: {
    isEnabled: true,
    wallets: [],
    defaultWallet: DEFAULT_WALLET,
  },
  mintTokens: [],
  networks: [],
  defaultNetwork: DEFAULT_NETWORK,
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

    if (config.accountConfig?.isEnabled) {
      providers.push(accountServiceProvider());
    }

    if (config.balanceConfig?.isEnabled && config.mintTokens) {
      providers.push(balanceServiceProvider());
    }

    if (
      config.balanceConfig?.isEnabled &&
      config.networks &&
      config.defaultNetwork
    ) {
      providers.push(
        connectionServiceProvider(config.networks, config.defaultNetwork)
      );
    }

    if (config.marketConfig?.isEnabled && config.mintTokens) {
      providers.push(marketServiceProvider(config.mintTokens));
    }

    if (
      config.walletConfig?.isEnabled &&
      config.walletConfig?.wallets &&
      config.walletConfig?.defaultWallet
    ) {
      providers.push(
        walletServiceProvider(
          config.walletConfig?.wallets,
          config.walletConfig?.defaultWallet
        )
      );
    }

    return {
      ngModule: SolanaDappModule,
      providers: providers,
    };
  }
}
