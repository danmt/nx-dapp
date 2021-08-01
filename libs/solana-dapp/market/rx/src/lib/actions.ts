import {
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { SerumMarket } from '@nx-dapp/solana-dapp/market/base';
import { Connection } from '@solana/web3.js';

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

export class LoadMarketByMintAction {
  type = 'loadMarketByMint';

  constructor(public payload: Map<string, SerumMarket>) {}
}

export class LoadMarketAccountsAction {
  type = 'loadMarketAccounts';

  constructor(public payload: Map<string, ParsedAccountBase>) {}
}

export class LoadMarketMintAccountsAction {
  type = 'loadMarketMintAccounts';

  constructor(public payload: Map<string, ParsedAccountBase>) {}
}

export class LoadMarketIndicatorAccountsAction {
  type = 'loadMarketIndicatorAccounts';

  constructor(public payload: Map<string, ParsedAccountBase>) {}
}

export class LoadConnectionAction {
  type = 'loadConnection';

  constructor(public payload: Connection) {}
}
