import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana/account-adapter/base';
import { SerumMarket } from '@nx-dapp/solana/market-adapter/base';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import {
  AccountChangedAction,
  ChangeAccountAction,
  GetMintAccountsAction,
  InitAction,
  LoadConnectionAction,
  LoadMarketAccountsAction,
  LoadMarketByMintAction,
  LoadMarketMintAccountsAction,
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
  | LoadMarketByMintAction
  | LoadMarketAccountsAction
  | LoadMarketMintAccountsAction;

export interface AccountState {
  tokenAccounts: TokenAccount[];
  nativeAccount: TokenAccount | null;
  selectedMintAddresses: PublicKey[];
  mintAccounts: MintTokenAccount[];
  marketAccounts: ParsedAccountBase[];
  marketMintAccounts: ParsedAccountBase[];
  marketIndicatorAccounts: ParsedAccountBase[];
}

export interface IAccountService {
  state$: Observable<AccountState>;
  actions$: Observable<Action>;
  userAccounts$: Observable<TokenAccount[]>;
  nativeAccount$: Observable<TokenAccount | null>;
  mintAccounts$: Observable<MintTokenAccount[]>;
  marketAccounts$: Observable<ParsedAccountBase[]>;
  marketMintAccounts$: Observable<ParsedAccountBase[]>;
  marketIndicatorAccounts$: Observable<ParsedAccountBase[]>;

  loadConnection(connection: Connection): void;

  loadWalletPublicKey(publicKey: PublicKey): void;

  loadWalletConnected(publicKey: boolean): void;

  loadMarketByMint(marketByMint: Map<string, SerumMarket>): void;

  changeAccount(account: AccountInfo<Buffer>): void;

  getMintAccounts(publicKeys: PublicKey[]): void;
}
