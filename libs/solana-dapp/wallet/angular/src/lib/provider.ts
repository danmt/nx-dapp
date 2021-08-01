import { InjectionToken } from '@angular/core';
import { Wallet } from '@nx-dapp/solana-dapp/wallet/base';
import { WalletService } from '@nx-dapp/solana-dapp/wallet/rx';

export const WALLET_SERVICE = new InjectionToken<WalletService>(
  'wallet-service'
);

export const walletServiceProvider = (wallets: Wallet[]) => ({
  provide: WALLET_SERVICE,
  useFactory: () => new WalletService(wallets),
});
