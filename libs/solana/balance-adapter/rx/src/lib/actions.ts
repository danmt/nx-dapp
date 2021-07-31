import {
  MintTokenAccount,
  TokenAccount,
} from '@nx-dapp/solana/account-adapter/base';
import { Balance } from '@nx-dapp/solana/balance-adapter/base';
import { SerumMarket } from '@nx-dapp/solana/market-adapter/base';

export class InitAction {
  type = 'init';
}

export class LoadUserAccountsAction {
  type = 'loadUserAccounts';

  constructor(public payload: TokenAccount[]) {}
}

export class LoadMintAccountsAction {
  type = 'loadMintAccounts';

  constructor(public payload: MintTokenAccount[]) {}
}

export class LoadBalancesAction {
  type = 'loadBalances';

  constructor(public payload: Balance[]) {}
}

export class LoadMarketByMintAction {
  type = 'loadMarketByMint';

  constructor(public payload: Map<string, SerumMarket>) {}
}
