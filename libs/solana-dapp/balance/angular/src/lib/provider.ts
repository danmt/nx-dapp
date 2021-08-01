import { InjectionToken } from '@angular/core';
import { TokenDetails } from '@nx-dapp/solana-dapp/balance/base';
import { BalanceService } from '@nx-dapp/solana-dapp/balance/rx';

export const BALANCE_SERVICE = new InjectionToken<BalanceService>(
  'balance-service'
);

export const balanceServiceProvider = (mintTokens: TokenDetails[]) => ({
  provide: BALANCE_SERVICE,
  useFactory: () => new BalanceService(mintTokens),
});
