import { TokenAccount } from '@nx-dapp/solana/account-adapter/base';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import {
  InitAction,
  LoadConnectionAction,
  LoadTokenAccountsAction,
  LoadWalletConnectedAction,
  LoadWalletPublicKeyAction,
} from './actions';

export type Action =
  | InitAction
  | LoadConnectionAction
  | LoadWalletPublicKeyAction
  | LoadWalletConnectedAction
  | LoadTokenAccountsAction;

export interface AccountState {
  userAccounts: TokenAccount[];
  tokenAccounts: TokenAccount[];
  nativeAccount: AccountInfo<Buffer> | null;
  connection: Connection | null;
  walletPublicKey: PublicKey | null;
  walletConnected: boolean;
}

export interface IAccountService {
  state$: Observable<AccountState>;
  actions$: Observable<Action>;

  loadConnection(connection: Connection): void;

  loadWalletPublicKey(publicKey: PublicKey | null): void;

  loadWalletConnected(publicKey: boolean): void;
}
