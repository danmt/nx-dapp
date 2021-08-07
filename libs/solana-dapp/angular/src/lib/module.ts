import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  DEFAULT_NETWORK,
  Network,
  NETWORKS,
} from '@nx-dapp/solana-dapp/network';
import {
  DEFAULT_WALLET,
  getPhantomWallet,
  getSolletWallet,
  getSolongWallet,
  Wallet,
  WalletName,
  walletServiceProvider,
} from '@nx-dapp/solana-dapp/wallet/angular';

export interface SolanaDappWalletConfig {
  isEnabled: boolean;
  wallets: Wallet[];
  defaultWallet: WalletName;
}

export interface SolanaDappConfig {
  walletConfig: SolanaDappWalletConfig;
  networks: Network[];
  defaultNetwork: Network;
}

export const SOLANA_DAPP_DEFAULT_CONFIG: SolanaDappConfig = {
  walletConfig: {
    isEnabled: true,
    wallets: [getPhantomWallet(), getSolletWallet(), getSolongWallet()],
    defaultWallet: DEFAULT_WALLET,
  },
  networks: NETWORKS,
  defaultNetwork: DEFAULT_NETWORK,
};

@NgModule({
  imports: [CommonModule],
})
export class SolanaDappModule {
  static forRoot(
    config?: SolanaDappConfig
  ): ModuleWithProviders<SolanaDappModule> {
    config = {
      ...SOLANA_DAPP_DEFAULT_CONFIG,
      ...config,
    };

    return {
      ngModule: SolanaDappModule,
      providers: [
        walletServiceProvider(
          config.walletConfig.wallets,
          config.walletConfig.defaultWallet,
          NETWORKS.find(
            (network) => network.name === config?.defaultNetwork.name
          ) || null
        ),
      ],
    };
  }
}
