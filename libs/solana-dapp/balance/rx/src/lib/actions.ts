import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { Balance, TokenDetails } from '@nx-dapp/solana-dapp/balance/base';
import { SerumMarket } from '@nx-dapp/solana-dapp/market/base';
import { TokenInfo } from '@solana/spl-token-registry';

export class InitAction {
  type = 'init';
}

export class LoadTokenAccountsAction {
  type = 'loadTokenAccounts';

  constructor(public payload: Map<string, TokenAccount>) {}
}

export class LoadMintTokensAction {
  type = 'loadMintTokens';

  constructor(public payload: TokenDetails[]) {}
}

export class LoadMintAccountsAction {
  type = 'loadMintAccounts';

  constructor(public payload: Map<string, MintTokenAccount>) {}
}

export class LoadBalancesAction {
  type = 'loadBalances';

  constructor(public payload: Balance[]) {}
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

export class LoadNetworkTokensAction {
  type = 'loadNetworkTokens';

  constructor(public payload: Map<string, TokenInfo>) {}
}

export class LoadWalletConnectedAction {
  type = 'loadWalletConnected';

  constructor(public payload: boolean) {}
}

export class ResetAction {
  type = 'reset';
}
