import { DEFAULT_WALLET } from '@nx-dapp/solana-dapp/wallet/base';

import {
  ChangeWalletAction,
  LoadWalletsAction,
  SignTransactionAction,
  SignTransactionsAction,
  TransactionSignedAction,
  TransactionsSignedAction,
  WalletChangedAction,
} from './actions';
import { Action, WalletState } from './types';

export const walletInitialState: WalletState = {
  publicKey: null,
  connected: false,
  connecting: false,
  disconnecting: false,
  autoApprove: false,
  ready: false,
  selectedWallet: DEFAULT_WALLET,
  wallets: [],
  wallet: null,
  adapter: null,
  signing: false,
  transactions: [],
};

export const reducer = (state: WalletState, action: Action) => {
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
    case 'changeWallet': {
      return {
        ...state,
        selectedWallet: (action as ChangeWalletAction).payload,
        wallet: null,
        adapter: null,
        ready: false,
        publicKey: null,
        connected: false,
        autoApprove: false,
        connecting: false,
        disconnecting: false,
      };
    }
    case 'walletChanged': {
      const adapter = (action as WalletChangedAction).payload.adapter();

      return {
        ...state,
        wallet: (action as WalletChangedAction).payload,
        adapter,
        ready: adapter?.ready || false,
        publicKey: adapter?.publicKey || null,
        autoApprove: adapter?.autoApprove || false,
      };
    }
    case 'connectWallet': {
      return {
        ...state,
        connecting: true,
      };
    }
    case 'walletConnected': {
      return {
        ...state,
        connecting: false,
        connected: true,
        publicKey: state.adapter?.publicKey || null,
        autoApprove: state.adapter?.autoApprove || false,
      };
    }
    case 'disconnectWallet': {
      return {
        ...state,
        disconnecting: true,
      };
    }
    case 'walletDisconnected': {
      return {
        ...state,
        disconnecting: false,
        connected: false,
        publicKey: null,
        autoApprove: false,
      };
    }
    case 'signTransaction': {
      return {
        ...state,
        signing: true,
        transactions: [
          ...state.transactions,
          (action as SignTransactionAction).payload,
        ],
      };
    }
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
    case 'signTransactions': {
      return {
        ...state,
        signing: true,
        transactions: [
          ...state.transactions,
          ...(action as SignTransactionsAction).payload,
        ],
      };
    }
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
    default:
      return state;
  }
};
