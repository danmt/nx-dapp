import { TokenAccount } from '@nx-dapp/solana/account-adapter/base';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import {
  AccountChangedAction,
  ChangeAccountAction,
  InitAction,
  LoadConnectionAction,
  LoadNativeAccountAction,
  LoadTokenAccountsAction,
  LoadWalletConnectedAction,
  LoadWalletPublicKeyAction,
} from './actions';

export type Action =
  | InitAction
  | LoadConnectionAction
  | LoadWalletPublicKeyAction
  | LoadWalletConnectedAction
  | LoadTokenAccountsAction
  | LoadNativeAccountAction
  | ChangeAccountAction
  | AccountChangedAction;

export interface AccountState {
  userAccounts: TokenAccount[];
  tokenAccounts: TokenAccount[];
  nativeAccount: TokenAccount | null;
}

export interface IAccountService {
  state$: Observable<AccountState>;
  actions$: Observable<Action>;
  userAccounts$: Observable<TokenAccount[]>;
  nativeAccount$: Observable<TokenAccount | null>;

  loadConnection(connection: Connection): void;

  loadWalletPublicKey(publicKey: PublicKey): void;

  loadWalletConnected(publicKey: boolean): void;

  changeAccount(account: AccountInfo<Buffer>): void;
}
