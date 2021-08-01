import {
  MintTokenAccount,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';

import {
  AccountChangedAction,
  ChangeAccountAction,
  GetMintAccountsAction,
  InitAction,
  LoadConnectionAction,
  LoadMarketByMintAction,
  LoadMintAccountsAction,
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
  | AccountChangedAction
  | GetMintAccountsAction
  | LoadMintAccountsAction
  | LoadMarketByMintAction;

export interface AccountState {
  tokenAccounts: TokenAccount[];
  nativeAccount: TokenAccount | null;
  selectedMintAddresses: PublicKey[];
  mintAccounts: MintTokenAccount[];
}

export interface IAccountService {
  state$: Observable<AccountState>;
  actions$: Observable<Action>;
  userAccounts$: Observable<TokenAccount[]>;
  nativeAccount$: Observable<TokenAccount | null>;
  mintAccounts$: Observable<MintTokenAccount[]>;

  loadConnection(connection: Connection): void;

  loadWalletPublicKey(publicKey: PublicKey): void;

  loadWalletConnected(publicKey: boolean): void;

  changeAccount(account: AccountInfo<Buffer>): void;

  getMintAccounts(publicKeys: PublicKey[]): void;
}