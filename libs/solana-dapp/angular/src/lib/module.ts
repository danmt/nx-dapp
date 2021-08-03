import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { balanceServiceProvider } from '@nx-dapp/solana-dapp/balance/angular';
import {
  connectionServiceProvider,
  DEFAULT_NETWORK,
  Network,
  NETWORKS,
} from '@nx-dapp/solana-dapp/connection/angular';
import {
  DEFAULT_MARKET_NETWORK,
  marketServiceProvider,
  TokenDetails,
} from '@nx-dapp/solana-dapp/market/angular';
import {
  DEFAULT_WALLET,
  getPhantomWallet,
  getSolletWallet,
  getSolongWallet,
  Wallet,
  WalletName,
  walletServiceProvider,
} from '@nx-dapp/solana-dapp/wallet/angular';
import { NATIVE_MINT } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

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
  balanceConfig?: SolanaDappBalanceConfig;
  connectionConfig?: SolanaDappConnectionConfig;
  marketConfig?: SolanaDappMarketConfig;
  walletConfig?: SolanaDappWalletConfig;
  mintTokens?: TokenDetails[];
  networks?: Network[];
  defaultNetwork?: string;
  marketNetwork?: Network;
}

export const SOLANA_DAPP_DEFAULT_CONFIG: SolanaDappConfig = {
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
    wallets: [getPhantomWallet(), getSolletWallet(), getSolongWallet()],
    defaultWallet: DEFAULT_WALLET,
  },
  mintTokens: [
    {
      label: 'Serum',
      address: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
      pubkey: new PublicKey('SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'),
    },
    {
      label: 'Solana',
      address: NATIVE_MINT.toBase58(),
      pubkey: NATIVE_MINT,
    },
    {
      label: 'Kin',
      address: 'kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6',
      pubkey: new PublicKey('kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6'),
    },
    {
      label: 'USDC',
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      pubkey: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    },
    {
      label: 'Raydium',
      address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      pubkey: new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'),
    },
    {
      label: 'Solfarm',
      address: 'TuLipcqtGVXP9XR62wM8WWCm6a9vhLs7T1uoWBk6FDs',
      pubkey: new PublicKey('TuLipcqtGVXP9XR62wM8WWCm6a9vhLs7T1uoWBk6FDs'),
    },
  ],
  networks: NETWORKS,
  defaultNetwork: DEFAULT_NETWORK,
  marketNetwork: DEFAULT_MARKET_NETWORK,
};

@NgModule({
  imports: [CommonModule],
})
export class SolanaDappModule {
  static forRoot(
    config?: SolanaDappConfig
  ): ModuleWithProviders<SolanaDappModule> {
    const providers = [];
    config = {
      ...SOLANA_DAPP_DEFAULT_CONFIG,
      ...config,
    };

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

    if (
      config.marketConfig?.isEnabled &&
      config.marketNetwork &&
      config.mintTokens
    ) {
      providers.push(
        marketServiceProvider(config.marketNetwork, config.mintTokens)
      );
    }

    if (
      config.walletConfig?.isEnabled &&
      config.walletConfig?.wallets &&
      config.walletConfig?.defaultWallet
    ) {
      providers.push(
        walletServiceProvider(
          config.walletConfig.wallets,
          config.walletConfig.defaultWallet
        )
      );
    }

    return {
      ngModule: SolanaDappModule,
      providers: providers,
    };
  }
}
