import { Network } from '@nx-dapp/solana-dapp/network';
import { PublicKey, Transaction } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';
import { Observable } from 'rxjs';

import { ActionTypes, WalletState } from './state';

export interface WalletAdapterEvents {
  ready: () => void;
  connect: () => void;
  disconnect: () => void;
  error: (error: Error) => void;
}

export interface WalletAdapter extends EventEmitter<WalletAdapterEvents> {
  publicKey: PublicKey | null;
  ready: boolean;
  connecting: boolean;
  connected: boolean;
  autoApprove: boolean;

  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>;
}

export enum WalletAdapterNetwork {
  Mainnet = 'mainnet-beta',
  Testnet = 'testnet',
  Devnet = 'devnet',
}

export enum WalletName {
  Phantom = 'Phantom',
  Solong = 'Solong',
  Sollet = 'Sollet',
}

export interface Wallet {
  name: WalletName;
  url: string;
  icon: string;
  adapter: () => WalletAdapter;
}

export const DEFAULT_WALLET = WalletName.Sollet;

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

  loadWallets(wallets: Wallet[]): void;

  selectWallet(wallet: WalletName): void;

  connect(): void;

  disconnect(): void;

  signTransaction(transaction: Transaction): void;

  signAllTransactions(transactions: Transaction[]): void;
}
