import { Transaction } from './transaction';
import { PublicKey, Transaction as Web3Transaction } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';

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
  signTransaction: (transaction: Transaction) => Promise<Web3Transaction>;
  signAllTransactions: (
    transaction: Web3Transaction[]
  ) => Promise<Web3Transaction[]>;
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
  Solflare = 'Solflare',
}

export interface Wallet {
  name: WalletName;
  url: string;
  icon: string;
  adapter: () => WalletAdapter;
}
