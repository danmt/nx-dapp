import { Wallet, WalletName } from '@nx-dapp/solana/wallet-adapter/base';

export class InitAction {
  type = 'init';
}

export class ConnectAction {
  type = 'connect';
}

export class ReadyAction {
  type = 'ready';
}

export class DisconnectAction {
  type = 'disconnect';
}

export class ConnectingAction {
  type = 'connecting';
  constructor(public payload: boolean) {}
}

export class DisconnectingAction {
  type = 'disconnecting';
  constructor(public payload: boolean) {}
}

export class SelectWalletAction {
  type = 'selectWallet';

  constructor(public payload: WalletName) {}
}

export class ClearWalletAction {
  type = 'clearWallet';
}

export class LoadWalletsAction {
  type = 'loadWallets';

  constructor(public payload: Wallet[]) {}
}
