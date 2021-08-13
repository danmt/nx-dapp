import {
  Transaction,
  Wallet,
  WalletAdapter,
  WalletName,
} from '@nx-dapp/solana-dapp/utils/types';
import { PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';

import { ActionTypes, WalletState } from './state';

export interface IWalletClient {
  actions$: Observable<ActionTypes>;
  state$: Observable<WalletState>;
  ready$: Observable<boolean>;
  connected$: Observable<boolean>;
  walletName$: Observable<WalletName | null>;
  wallets$: Observable<Wallet[]>;
  wallet$: Observable<Wallet | null>;
  adapter$: Observable<WalletAdapter | null>;
  publicKey$: Observable<PublicKey | null>;
  selectedWallet$: Observable<WalletName | null>;
  connecting$: Observable<boolean>;
  disconnecting$: Observable<boolean>;
  onConnect$: Observable<boolean>;
  onDisconnect$: Observable<boolean>;

  loadWallets(wallets: Wallet[]): void;

  selectWallet(wallet: WalletName): void;

  connect(): void;

  disconnect(): void;

  signTransaction(transaction: Transaction): void;

  signAllTransactions(transactions: Transaction[]): void;
}
