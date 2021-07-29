import { TokenAccount } from '@nx-dapp/solana/account-adapter/base';
import { Connection, PublicKey } from '@solana/web3.js';

export class InitAction {
  type = 'init';
}

export class LoadConnectionAction {
  type = 'loadConnection';

  constructor(public payload: Connection) {}
}

export class LoadWalletPublicKeyAction {
  type = 'loadWalletPublicKey';

  constructor(public payload: PublicKey | null) {}
}

export class LoadWalletConnectedAction {
  type = 'loadWalletConnected';

  constructor(public payload: boolean) {}
}

export class LoadTokenAccountsAction {
  type = 'loadTokenAccounts';

  constructor(public payload: TokenAccount[]) {}
}
