import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';

import {
  LoadNativeAccountAction,
  LoadTokenAccountsAction,
  LoadWalletsAction,
  SelectWalletAction,
  SignTransactionAction,
  SignTransactionsAction,
  TransactionSignedAction,
  TransactionsSignedAction,
  WalletSelectedAction,
} from './actions';
import { Action, WalletState } from './types';

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
  nativeAccount: null,
  tokenAccounts: new Map<string, TokenAccount>(),
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
    case 'walletNetworkChanged':
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
    case 'loadTokenAccounts': {
      const tokenAccounts = (action as LoadTokenAccountsAction).payload;
      const nativeAccount = state.nativeAccount;

      if (nativeAccount) {
        tokenAccounts.set(nativeAccount.pubkey.toBase58(), nativeAccount);
      }

      return {
        ...state,
        tokenAccounts: new Map(tokenAccounts),
      };
    }
    case 'loadNativeAccount': {
      const nativeAccount = (action as LoadNativeAccountAction).payload;
      const tokenAccounts = state.tokenAccounts.set(
        nativeAccount.pubkey.toBase58(),
        nativeAccount
      );

      return {
        ...state,
        nativeAccount,
        tokenAccounts: new Map(tokenAccounts),
      };
    }
    case 'reset':
      return {
        ...state,
        nativeAccount: null,
        tokenAccounts: new Map<string, TokenAccount>(),
      };
    default:
      return state;
  }
};
