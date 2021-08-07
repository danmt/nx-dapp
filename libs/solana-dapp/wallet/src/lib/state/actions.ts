import { Network } from '@nx-dapp/solana-dapp/network';
import { Transaction } from '@solana/web3.js';

import { Wallet, WalletName } from '../types';

export class InitAction {
  type = 'init';
}

export class LoadWalletsAction {
  type = 'loadWallets';

  constructor(public payload: Wallet[]) {}
}

export class SelectWalletAction {
  type = 'selectWallet';

  constructor(public payload: WalletName) {}
}

export class WalletSelectedAction {
  type = 'walletSelected';

  constructor(public payload: Wallet) {}
}

export class ConnectWalletAction {
  type = 'connectWallet';
}

export class WalletConnectedAction {
  type = 'walletConnected';
}

export class DisconnectWalletAction {
  type = 'disconnectWallet';
}

export class WalletDisconnectedAction {
  type = 'walletDisconnected';
}

export class SignTransactionAction {
  type = 'signTransaction';

  constructor(public payload: Transaction) {}
}

export class TransactionSignedAction {
  type = 'transactionSigned';

  constructor(public payload: Transaction) {}
}

export class SignTransactionsAction {
  type = 'signTransactions';

  constructor(public payload: Transaction[]) {}
}

export class TransactionsSignedAction {
  type = 'transactionsSigned';

  constructor(public payload: Transaction[]) {}
}

export class SetNetworkAction {
  type = 'setNetwork';

  constructor(public payload: Network | null) {}
}

export class WalletNetworkChangedAction {
  type = 'walletNetworkChanged';
}

export type ActionTypes =
  | InitAction
  | LoadWalletsAction
  | ConnectWalletAction
  | WalletConnectedAction
  | DisconnectWalletAction
  | WalletDisconnectedAction
  | SignTransactionAction
  | TransactionSignedAction
  | SelectWalletAction
  | WalletSelectedAction
  | SetNetworkAction
  | SignTransactionsAction
  | TransactionsSignedAction
  | WalletNetworkChangedAction;
