import {
  MintTokenAccount,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { SerumMarket } from '@nx-dapp/solana-dapp/market/base';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';

export class InitAction {
  type = 'init';
}

export class LoadConnectionAction {
  type = 'loadConnection';

  constructor(public payload: Connection) {}
}

export class LoadWalletPublicKeyAction {
  type = 'loadWalletPublicKey';

  constructor(public payload: PublicKey) {}
}

export class LoadWalletConnectedAction {
  type = 'loadWalletConnected';

  constructor(public payload: boolean) {}
}

export class LoadTokenAccountsAction {
  type = 'loadTokenAccounts';

  constructor(
    public payload: {
      tokenAccounts: TokenAccount[];
      walletPublicKey: PublicKey;
    }
  ) {}
}

export class LoadNativeAccountAction {
  type = 'loadNativeAccount';

  constructor(public payload: TokenAccount) {}
}

export class ChangeAccountAction {
  type = 'changeAccount';

  constructor(public payload: AccountInfo<Buffer>) {}
}

export class AccountChangedAction {
  type = 'accountChanged';

  constructor(public payload: TokenAccount) {}
}

export class LoadMintTokensAction {
  type = 'loadMintTokens';

  constructor(public payload: PublicKey[]) {}
}

export class LoadMintAccountsAction {
  type = 'loadMintAccounts';

  constructor(public payload: MintTokenAccount[]) {}
}

export class LoadMarketByMintAction {
  type = 'loadMarketByMint';

  constructor(public payload: Map<string, SerumMarket>) {}
}

export class ResetAction {
  type = 'reset';
}
