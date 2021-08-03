import { InjectionToken } from '@angular/core';
import { BalanceService } from '@nx-dapp/solana-dapp/balance/rx';

export const BALANCE_SERVICE = new InjectionToken<BalanceService>(
  'balance-service'
);

export const balanceServiceProvider = () => ({
  provide: BALANCE_SERVICE,
  useFactory: () => new BalanceService(),
});
