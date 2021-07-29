import { InjectionToken } from '@angular/core';
import { Wallet } from '@nx-dapp/solana/wallet-adapter/base';
import { WalletService } from '@nx-dapp/solana/wallet-adapter/rx';

export const WALLET_SERVICE = new InjectionToken<WalletService>(
  'wallet-service'
);

export const walletServiceProvider = (wallets: Wallet[]) => ({
  provide: WALLET_SERVICE,
  useFactory: () => new WalletService(wallets),
});