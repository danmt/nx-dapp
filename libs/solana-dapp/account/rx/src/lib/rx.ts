import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { ofType } from '@nx-dapp/shared/operators/of-type';
import {
  MintParser,
  MintTokenAccount,
  TokenAccount,
  TokenAccountParser,
  wrapNativeAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { TokenDetails } from '@nx-dapp/solana-dapp/balance/base';
import { MintLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import {
  asyncScheduler,
  BehaviorSubject,
  combineLatest,
  defer,
  from,
  merge,
  Observable,
  Subject,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  observeOn,
  scan,
  shareReplay,
  switchMap,
  takeUntil,
  toArray,
} from 'rxjs/operators';

import {
  ChangeAccountAction,
  InitAction,
  LoadConnectionAction,
  LoadMintAccountsAction,
  LoadMintTokensAction,
  LoadNativeAccountAction,
  LoadTokenAccountsAction,
  LoadWalletConnectedAction,
  LoadWalletPublicKeyAction,
  ResetAction,
} from './actions';
import { accountInitialState, reducer } from './state';
import { Action, IAccountService } from './types';

export class AccountService implements IAccountService {
  private readonly _destroy = new Subject();
  private readonly _dispatcher = new BehaviorSubject<Action>(new InitAction());
  actions$ = this._dispatcher.asObservable();
  state$ = this._dispatcher.pipe(
    scan(reducer, accountInitialState),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  tokenAccounts$ = this.state$.pipe(
    map(({ tokenAccounts }) => tokenAccounts),
    distinctUntilChanged()
  );
  nativeAccount$ = this.state$.pipe(
    map(({ nativeAccount }) => nativeAccount),
    distinctUntilChanged()
  );
  mintAccounts$ = this.state$.pipe(
    map(({ mintAccounts }) => mintAccounts),
    distinctUntilChanged()
  );

  private loadNativeAccount$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(
      ofType<LoadWalletPublicKeyAction>('loadWalletPublicKey')
    ),
    this.actions$.pipe(
      ofType<LoadWalletConnectedAction>('loadWalletConnected')
    ),
  ]).pipe(
    filter(([, , { payload: walletConnected }]) => walletConnected),
    switchMap(([{ payload: connection }, { payload: walletPublicKey }]) =>
      from(defer(() => connection.getAccountInfo(walletPublicKey))).pipe(
        isNotNull,
        map(
          (account) =>
            new LoadNativeAccountAction(
              wrapNativeAccount(walletPublicKey, account)
            )
        )
      )
    )
  );

  private accountChanged$ = combineLatest([
    this.actions$.pipe(ofType<ChangeAccountAction>('changeAccount')),
    this.actions$.pipe(
      ofType<LoadWalletPublicKeyAction>('loadWalletPublicKey')
    ),
    this.actions$.pipe(
      ofType<LoadWalletConnectedAction>('loadWalletConnected')
    ),
  ]).pipe(
    filter(([, , { payload: walletConnected }]) => walletConnected),
    map(
      ([{ payload: account }, { payload: walletPublicKey }]) =>
        new LoadNativeAccountAction(
          TokenAccountParser(walletPublicKey, account)
        )
    )
  );

  private loadTokenAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(
      ofType<LoadWalletPublicKeyAction>('loadWalletPublicKey')
    ),
    this.actions$.pipe(
      ofType<LoadWalletConnectedAction>('loadWalletConnected')
    ),
  ]).pipe(
    filter(([, , { payload: walletConnected }]) => walletConnected),
    switchMap(([{ payload: connection }, { payload: walletPublicKey }]) =>
      from(
        defer(() =>
          connection.getTokenAccountsByOwner(walletPublicKey, {
            programId: TOKEN_PROGRAM_ID,
          })
        )
      ).pipe(
        map(
          (accounts) =>
            new LoadTokenAccountsAction(
              accounts.value
                .filter(({ account }) => account.data.length > 0)
                .map(({ account, pubkey }) =>
                  TokenAccountParser(new PublicKey(pubkey.toBase58()), account)
                )
                .reduce(
                  (tokenAccounts, account) =>
                    tokenAccounts.set(account.pubkey.toBase58(), account),
                  new Map<string, TokenAccount>()
                )
            )
        )
      )
    )
  );

  private loadMintAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(ofType<LoadMintTokensAction>('loadMintTokens')),
  ]).pipe(
    switchMap(([{ payload: connection }, { payload: mintKeys }]) =>
      from(mintKeys).pipe(
        mergeMap((mintKey) =>
          from(defer(() => connection.getAccountInfo(mintKey))).pipe(
            isNotNull,
            // Mint account can be empty (specially in localnet, devnet and testnet)
            // In order to prevent errors from throwing, just filter the
            // accounts based on its length
            filter(({ data }) => data.length === MintLayout.span),
            map((account) => MintParser(mintKey, account))
          )
        ),
        toArray(),
        map(
          (accounts) =>
            new LoadMintAccountsAction(
              accounts.reduce(
                (mintAccounts, account) =>
                  mintAccounts.set(account.pubkey.toBase58(), account),
                new Map<string, MintTokenAccount>()
              )
            )
        )
      )
    )
  );

  private reset$ = this.actions$.pipe(
    ofType<LoadWalletConnectedAction>('loadWalletConnected'),
    filter(({ payload: walletConnected }) => !walletConnected),
    map(() => new ResetAction())
  );

  constructor(mintTokens: TokenDetails[]) {
    this.runEffects([
      this.loadTokenAccounts$,
      this.loadNativeAccount$,
      this.accountChanged$,
      this.loadMintAccounts$,
      this.reset$,
    ]);

    this.loadMintTokens(mintTokens.map(({ pubkey }) => pubkey));
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this._destroy), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }

  loadConnection(connection: Connection) {
    this._dispatcher.next(new LoadConnectionAction(connection));
  }

  loadWalletPublicKey(walletPublicKey: PublicKey) {
    this._dispatcher.next(new LoadWalletPublicKeyAction(walletPublicKey));
  }

  loadWalletConnected(walletConnected: boolean) {
    this._dispatcher.next(new LoadWalletConnectedAction(walletConnected));
  }

  changeAccount(account: AccountInfo<Buffer>) {
    this._dispatcher.next(new ChangeAccountAction(account));
  }

  loadMintTokens(publicKeys: PublicKey[]) {
    this._dispatcher.next(new LoadMintTokensAction(publicKeys));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
