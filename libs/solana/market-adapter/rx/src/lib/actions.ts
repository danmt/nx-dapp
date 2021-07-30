import { TokenAccount } from '@nx-dapp/solana/account-adapter/base';

export class InitAction {
  type = 'init';
}

export class LoadUserAccountsAction {
  type = 'loadUserAccounts';

  constructor(public payload: TokenAccount[]) {}
}

export class LoadNativeAccountAction {
  type = 'loadNativeAccount';

  constructor(public payload: TokenAccount) {}
}

export class LoadMarketMintsAction {
  type = 'loadMarketMints';

  constructor(public payload: string[]) {}
}
