import { InjectionToken } from '@angular/core';
import { AccountService } from '@nx-dapp/solana-dapp/account/rx';
import { TokenDetails } from '@nx-dapp/solana-dapp/balance/base';

export const ACCOUNT_SERVICE = new InjectionToken<AccountService>(
  'account-service'
);

export const accountServiceProvider = (mintTokens: TokenDetails[]) => ({
  provide: ACCOUNT_SERVICE,
  useFactory: () => new AccountService(mintTokens),
});
