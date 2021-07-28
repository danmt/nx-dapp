import {
  Wallet,
  WalletAdapter,
  WalletName,
} from '@nx-dapp/solana/wallet-adapter/base';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  ClearWalletAction,
  ConnectAction,
  ConnectingAction,
  DisconnectAction,
  DisconnectingAction,
  InitAction,
  LoadWalletsAction,
  ReadyAction,
  SelectWalletAction,
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
}

export type Action =
  | InitAction
  | ConnectAction
  | DisconnectAction
  | ConnectingAction
  | DisconnectingAction
  | ReadyAction
  | SelectWalletAction
  | ClearWalletAction
  | LoadWalletsAction;

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
  connect(): Observable<void>;
  disconnect(): Observable<void>;
  signTransaction(transaction: Transaction): Observable<Transaction>;
  signAllTransactions(transactions: Transaction[]): Observable<Transaction[]>;
}
