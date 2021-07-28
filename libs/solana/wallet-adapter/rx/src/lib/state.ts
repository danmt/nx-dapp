import {
  DEFAULT_WALLET,
  Wallet,
  WalletAdapter,
  WalletName,
} from '@nx-dapp/solana/wallet-adapter/base';
import { PublicKey } from '@solana/web3.js';

import {
  ConnectingAction,
  DisconnectingAction,
  LoadWalletsAction,
  SelectWalletAction,
} from './actions';
import { Action } from './types';

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
};

export const reducer = (state: WalletState, action: Action) => {
  switch (action.type) {
    case 'ready':
      return {
        ...state,
        ready: true,
      };
    case 'connect':
      return {
        ...state,
        connected: true,
        publicKey: state.adapter?.publicKey || null,
        autoApprove: state.adapter?.autoApprove || false,
      };
    case 'connecting':
      return {
        ...state,
        connecting: (action as ConnectingAction).payload,
      };
    case 'disconnect':
      return {
        ...state,
        connected: false,
        publicKey: null,
        autoApprove: false,
      };
    case 'disconnecting':
      return {
        ...state,
        disconnecting: (action as DisconnectingAction).payload,
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
    case 'selectWallet': {
      const wallet =
        state.wallets.find(
          (wallet) => wallet.name === (action as SelectWalletAction).payload
        ) || null;
      const adapter = wallet?.adapter() || null;

      return {
        ...state,
        selectedWallet: (action as SelectWalletAction).payload,
        wallet,
        adapter,
        ready: adapter?.ready || false,
        publicKey: adapter?.publicKey || null,
        autoApprove: adapter?.autoApprove || false,
      };
    }
    case 'clearWallet': {
      return {
        ...state,
        selectedWallet: null,
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
    default:
      return state;
  }
};
