import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { Network } from '@nx-dapp/solana-dapp/connection/types';
import { Wallet, WalletName } from '@nx-dapp/solana-dapp/wallet/types';
import { Connection, Transaction } from '@solana/web3.js';

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

export class LoadNetworkAction {
  type = 'loadNetwork';

  constructor(public payload: Network) {}
}

export class WalletNetworkChangedAction {
  type = 'walletNetworkChanged';
}

export class LoadConnectionAction {
  type = 'loadConnection';

  constructor(public payload: Connection) {}
}

export class LoadNativeAccountAction {
  type = 'loadNativeAccount';

  constructor(public payload: TokenAccount) {}
}

export class LoadTokenAccountsAction {
  type = 'loadTokenAccounts';

  constructor(public payload: Map<string, TokenAccount>) {}
}

export class ResetAction {
  type = 'reset';
}
