import {
  PhantomWalletAdapter,
  PhantomWalletAdapterConfig,
} from '@nx-dapp/solana-dapp/wallet/adapters/phantom';
import {
  SolletWalletAdapter,
  SolletWalletAdapterConfig,
} from '@nx-dapp/solana-dapp/wallet/adapters/sollet';
import {
  SolongWalletAdapter,
  SolongWalletAdapterConfig,
} from '@nx-dapp/solana-dapp/wallet/adapters/solong';
import { Wallet, WalletName } from '@nx-dapp/solana-dapp/wallet/types';

export const ICONS_URL =
  'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons';

export const getPhantomWallet = (
  config?: PhantomWalletAdapterConfig
): Wallet => ({
  name: WalletName.Phantom,
  url: 'https://www.phantom.app',
  icon: `${ICONS_URL}/phantom.png`,
  adapter: () => new PhantomWalletAdapter(config),
});

export const getSolongWallet = (
  config?: SolongWalletAdapterConfig
): Wallet => ({
  name: WalletName.Solong,
  url: 'https://solongwallet.com',
  icon: `${ICONS_URL}/solong.png`,
  adapter: () => new SolongWalletAdapter(config),
});

export const getSolletWallet = (
  config?: SolletWalletAdapterConfig
): Wallet => ({
  name: WalletName.Sollet,
  url: 'https://www.sollet.io',
  icon: `${ICONS_URL}/sollet.svg`,
  adapter: () => new SolletWalletAdapter(config),
});
