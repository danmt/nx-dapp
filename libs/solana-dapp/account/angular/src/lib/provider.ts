import { InjectionToken } from '@angular/core';
import { AccountService } from '@nx-dapp/solana-dapp/account/rx';

export const ACCOUNT_SERVICE = new InjectionToken<AccountService>(
  'account-service'
);

export const accountServiceProvider = () => ({
  provide: ACCOUNT_SERVICE,
  useFactory: () => new AccountService(),
});
