import { Network } from '@nx-dapp/solana-dapp/network';
import {
  Wallet,
  WalletAdapter,
  WalletName,
} from '@nx-dapp/solana-dapp/wallet/types';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  ConnectWalletAction,
  DisconnectWalletAction,
  InitAction,
  LoadWalletsAction,
  SelectWalletAction,
  SetNetworkAction,
  SignTransactionAction,
  SignTransactionsAction,
  TransactionSignedAction,
  TransactionsSignedAction,
  WalletConnectedAction,
  WalletDisconnectedAction,
  WalletNetworkChangedAction,
  WalletSelectedAction,
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
  network: Network | null;
}

export type Action =
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
  network$: Observable<Network | null>;

  loadWallets(wallets: Wallet[]): void;

  selectWallet(wallet: WalletName): void;

  connect(): void;

  disconnect(): void;

  signTransaction(transaction: Transaction): void;

  signAllTransactions(transactions: Transaction[]): void;

  setNetwork(network: Network | null): void;
}
