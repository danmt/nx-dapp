import {
  Network,
  TokenAccount,
  Wallet,
  WalletAdapter,
  WalletName,
} from '@nx-dapp/solana-dapp/wallet/wallets';
import {
  AccountInfo,
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  ConnectAction,
  ConnectWalletAction,
  DisconnectAction,
  DisconnectWalletAction,
  InitAction,
  LoadNetworkAction,
  LoadWalletsAction,
  ReadyAction,
  SelectWalletAction,
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
  tokenAccounts: Map<string, TokenAccount>;
  nativeAccount: TokenAccount | null;
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
  tokenAccounts$: Observable<Map<string, TokenAccount>>;

  loadWallets(wallets: Wallet[]): void;

  selectWallet(wallet: WalletName): void;

  connect(): void;

  disconnect(): void;

  signTransaction(transaction: Transaction): void;

  signAllTransactions(transactions: Transaction[]): void;

  loadNetwork(network: Network): void;

  changeAccount(account: AccountInfo<Buffer>): void;

  loadConnection(connection: Connection): void;
}
