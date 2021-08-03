import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { SerumMarket, TokenDetails } from '@nx-dapp/solana-dapp/market/base';
import { Connection } from '@solana/web3.js';

export class InitAction {
  type = 'init';
}

export class LoadTokenAccountsAction {
  type = 'loadTokenAccounts';

  constructor(public payload: Map<string, TokenAccount>) {}
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

export class LoadMintTokensAction {
  type = 'loadMintTokens';

  constructor(public payload: TokenDetails[]) {}
}

export class LoadMintAccountsAction {
  type = 'loadMintAccounts';

  constructor(public payload: Map<string, MintTokenAccount>) {}
}
