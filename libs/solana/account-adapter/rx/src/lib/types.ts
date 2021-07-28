import { TokenAccount } from '@nx-dapp/solana/account-adapter/base';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import {
  InitAction,
  LoadConnectionAction,
  LoadWalletConnectedAction,
  LoadWalletPublicKeyAction,
} from './actions';

export type Action =
  | InitAction
  | LoadConnectionAction
  | LoadWalletPublicKeyAction
  | LoadWalletConnectedAction;

export interface AccountState {
  userAccounts: TokenAccount[];
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
