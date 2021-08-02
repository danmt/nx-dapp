import {
  MintTokenAccount,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  AccountChangedAction,
  ChangeAccountAction,
  InitAction,
  LoadConnectionAction,
  LoadMarketByMintAction,
  LoadMintAccountsAction,
  LoadMintTokensAction,
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
  | LoadMintAccountsAction
  | LoadMarketByMintAction
  | LoadMintTokensAction
  | ResetAction;

export interface AccountState {
  tokenAccounts: TokenAccount[];
  nativeAccount: TokenAccount | null;
  mintTokensAddresses: PublicKey[];
  mintAccounts: Map<string, MintTokenAccount>;
}

export interface IAccountService {
  state$: Observable<AccountState>;
  actions$: Observable<Action>;
  userAccounts$: Observable<TokenAccount[]>;
  nativeAccount$: Observable<TokenAccount | null>;
  mintAccounts$: Observable<Map<string, MintTokenAccount>>;

  loadConnection(connection: Connection): void;

  loadWalletPublicKey(walletPublicKey: PublicKey): void;

  loadWalletConnected(walletConnected: boolean): void;

  changeAccount(account: AccountInfo<Buffer>): void;

  loadMintTokens(publicKeys: PublicKey[]): void;
}
