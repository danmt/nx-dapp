import { InjectionToken } from '@angular/core';
import { Network } from '@nx-dapp/solana-dapp/network';
import {
  Wallet,
  WalletName,
  WalletService,
} from '@nx-dapp/solana-dapp/wallet/rx';

export const WALLET_SERVICE = new InjectionToken<WalletService>(
  'wallet-service'
);

export const walletServiceProvider = (
  wallets: Wallet[],
  defaultWallet: WalletName,
  defaultNetwork: Network | null
) => ({
  provide: WALLET_SERVICE,
  useFactory: () => new WalletService(wallets, defaultWallet, defaultNetwork),
});
