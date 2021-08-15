import {
  Network,
  TransactionPayload,
  Wallet,
  WalletName,
} from '@nx-dapp/solana-dapp/utils/types';

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

export class WalletConnectionFailedAction {
  type = 'walletConnectionFailed';

  constructor(public payload: string) {}
}

export class DisconnectWalletAction {
  type = 'disconnectWallet';
}

export class WalletDisconnectedAction {
  type = 'walletDisconnected';
}

export class SignTransactionAction {
  type = 'signTransaction';

  constructor(public payload: TransactionPayload) {}
}

export class TransactionSignedAction {
  type = 'transactionSigned';

  constructor(public payload: TransactionPayload) {}
}

export class SignTransactionsAction {
  type = 'signTransactions';

  constructor(public payload: TransactionPayload[]) {}
}

export class TransactionsSignedAction {
  type = 'transactionsSigned';

  constructor(public payload: TransactionPayload[]) {}
}

export class SetNetworkAction {
  type = 'setNetwork';

  constructor(public payload: Network) {}
}

export class NetworkChangedAction {
  type = 'networkChanged';
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
  | SignTransactionsAction
  | TransactionsSignedAction
  | SetNetworkAction
  | NetworkChangedAction
  | WalletConnectionFailedAction;
