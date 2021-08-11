import { Network } from '@nx-dapp/solana-dapp/network';
import { PublicKey } from '@solana/web3.js';
import { SetNetworkAction } from '.';

import { Wallet, WalletAdapter, WalletName, Transaction } from '../types';
import {
  ActionTypes,
  LoadWalletsAction,
  SelectWalletAction,
  SignTransactionAction,
  SignTransactionsAction,
  TransactionSignedAction,
  TransactionsSignedAction,
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

export const walletInitialState: WalletState = {
  publicKey: null,
  connected: false,
  connecting: false,
  disconnecting: false,
  autoApprove: false,
  ready: false,
  selectedWallet: null,
  wallets: [],
  wallet: null,
  adapter: null,
  signing: false,
  transactions: [],
  network: null,
};

export const reducer = (state: WalletState, action: ActionTypes) => {
  switch (action.type) {
    case 'ready':
      return {
        ...state,
        ready: true,
      };
    case 'loadWallets': {
      const wallet =
        (action as LoadWalletsAction).payload.find(
          (wallet) => wallet.name === state.selectedWallet
        ) || null;
      const adapter = wallet?.adapter() || null;

      return {
        ...state,
        wallets: (action as LoadWalletsAction).payload,
        wallet,
        adapter,
        ready: adapter?.ready || false,
      };
    }
    case 'selectWallet':
      return {
        ...state,
        selectedWallet: (action as SelectWalletAction).payload,
        wallet: null,
        adapter: null,
        ready: false,
        publicKey: null,
        connected: false,
        autoApprove: false,
        connecting: false,
        disconnecting: false,
      };
    case 'walletSelected': {
      const adapter = (action as WalletSelectedAction).payload.adapter();

      return {
        ...state,
        wallet: (action as WalletSelectedAction).payload,
        adapter,
        ready: adapter?.ready || false,
        publicKey: adapter?.publicKey || null,
        autoApprove: adapter?.autoApprove || false,
      };
    }
    case 'connectWallet':
      return {
        ...state,
        connecting: true,
      };
    case 'walletConnected':
      return {
        ...state,
        connecting: false,
        connected: true,
        publicKey: state.adapter?.publicKey || null,
        autoApprove: state.adapter?.autoApprove || false,
      };
    case 'disconnectWallet':
      return {
        ...state,
        disconnecting: true,
      };
    case 'walletDisconnected':
    case 'networkChanged':
    case 'walletConnectionFailed':
      return {
        ...state,
        disconnecting: false,
        connected: false,
        publicKey: null,
        autoApprove: false,
      };
    case 'signTransaction':
      return {
        ...state,
        signing: true,
        transactions: [
          ...state.transactions,
          (action as SignTransactionAction).payload,
        ],
      };
    case 'transactionSigned': {
      const transactions = state.transactions.filter(
        (transaction) =>
          transaction === (action as TransactionSignedAction).payload
      );

      return {
        ...state,
        transactions,
        signing: transactions.length > 0,
      };
    }
    case 'signTransactions':
      return {
        ...state,
        signing: true,
        transactions: [
          ...state.transactions,
          ...(action as SignTransactionsAction).payload,
        ],
      };
    case 'transactionsSigned': {
      const signedTransactions = (action as TransactionsSignedAction).payload;
      const transactions = state.transactions.filter((transaction) =>
        signedTransactions.some(
          (signedTransaction) => signedTransaction === transaction
        )
      );

      return {
        ...state,
        transactions,
        signing: transactions.length > 0,
      };
    }
    case 'setNetwork':
      return {
        ...state,
        network: (action as SetNetworkAction).payload,
      };
    default:
      return state;
  }
};
