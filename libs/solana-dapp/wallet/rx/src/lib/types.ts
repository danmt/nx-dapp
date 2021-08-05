import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { Network } from '@nx-dapp/solana-dapp/connection/types';
import {
  Wallet,
  WalletAdapter,
  WalletName,
} from '@nx-dapp/solana-dapp/wallet/types';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  ConnectWalletAction,
  DisconnectWalletAction,
  InitAction,
  LoadConnectionAction,
  LoadNativeAccountAction,
  LoadNetworkAction,
  LoadTokenAccountsAction,
  LoadWalletsAction,
  ResetAction,
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
  | WalletNetworkChangedAction
  | LoadConnectionAction
  | LoadNativeAccountAction
  | LoadTokenAccountsAction
  | ResetAction;

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
  tokenAccounts$: Observable<Map<string, TokenAccount>>;

  loadWallets(wallets: Wallet[]): void;

  selectWallet(wallet: WalletName): void;

  connect(): void;

  disconnect(): void;

  signTransaction(transaction: Transaction): void;

  signAllTransactions(transactions: Transaction[]): void;

  loadNetwork(network: Network): void;

  loadConnection(connection: Connection): void;
}
