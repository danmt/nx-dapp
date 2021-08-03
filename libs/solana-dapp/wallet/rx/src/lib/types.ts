import { Network } from '@nx-dapp/solana-dapp/connection/base';
import {
  Wallet,
  WalletAdapter,
  WalletName,
} from '@nx-dapp/solana-dapp/wallet/base';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  ConnectAction,
  ConnectWalletAction,
  DisconnectAction,
  DisconnectWalletAction,
  InitAction,
  LoadWalletsAction,
  ReadyAction,
  SelectWalletAction,
  SignTransactionAction,
  TransactionSignedAction,
  WalletConnectedAction,
  WalletDisconnectedAction,
  WalletSelectedAction,
  LoadNetworkAction,
  SignTransactionsAction,
  TransactionsSignedAction,
  WalletNetworkChangedAction,
} from './actions';

export interface WalletState {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  autoApprove: boolean;
  ready: boolean;
  selectedWallet: WalletName | null;
  wallets: Wallet[];
  wallet: Wallet | null;
  adapter: WalletAdapter | null;
  signing: boolean;
  transactions: Transaction[];
}

export type Action =
  | InitAction
  | ConnectAction
  | DisconnectAction
  | ReadyAction
  | LoadWalletsAction
  | ConnectWalletAction
  | WalletConnectedAction
  | DisconnectWalletAction
  | WalletDisconnectedAction
  | SignTransactionAction
  | TransactionSignedAction
  | SelectWalletAction
  | WalletSelectedAction
  | LoadNetworkAction
  | SignTransactionsAction
  | TransactionsSignedAction
  | WalletNetworkChangedAction;

export interface IWalletService {
  actions$: Observable<Action>;
  state$: Observable<WalletState>;
  ready$: Observable<boolean>;
  connected$: Observable<boolean>;
  walletName$: Observable<WalletName | null>;
  wallets$: Observable<Wallet[]>;
  wallet$: Observable<Wallet | null>;
  adapter$: Observable<WalletAdapter | null>;
  publicKey$: Observable<PublicKey | null>;
  onReady$: Observable<ReadyAction>;
  onConnect$: Observable<ConnectAction>;
  onDisconnect$: Observable<DisconnectAction>;
  onError$: Observable<unknown>; // TODO: Enhance error handling

  loadWallets(wallets: Wallet[]): void;

  selectWallet(wallet: WalletName): void;

  connect(): void;

  disconnect(): void;

  signTransaction(transaction: Transaction): void;

  signAllTransactions(transactions: Transaction[]): void;

  loadNetwork(network: Network): void;
}
