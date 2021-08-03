import { TokenAccount } from '@nx-dapp/solana-dapp/account/base';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  AccountChangedAction,
  ChangeAccountAction,
  InitAction,
  LoadConnectionAction,
  LoadMarketByMintAction,
  LoadNativeAccountAction,
  LoadTokenAccountsAction,
  LoadWalletConnectedAction,
  LoadWalletPublicKeyAction,
  ResetAction,
} from './actions';

export type Action =
  | InitAction
  | LoadConnectionAction
  | LoadWalletPublicKeyAction
  | LoadWalletConnectedAction
  | LoadTokenAccountsAction
  | LoadNativeAccountAction
  | ChangeAccountAction
  | AccountChangedAction
  | LoadMarketByMintAction
  | ResetAction;

export interface AccountState {
  tokenAccounts: Map<string, TokenAccount>;
  nativeAccount: TokenAccount | null;
}

export interface IAccountService {
  state$: Observable<AccountState>;
  actions$: Observable<Action>;
  tokenAccounts$: Observable<Map<string, TokenAccount>>;

  loadConnection(connection: Connection): void;

  loadWalletPublicKey(walletPublicKey: PublicKey): void;

  loadWalletConnected(walletConnected: boolean): void;

  changeAccount(account: AccountInfo<Buffer>): void;
}
