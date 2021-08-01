import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { ofType } from '@nx-dapp/shared/operators/of-type';
import {
  MintParser,
  TokenAccountParser,
  wrapNativeAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { TokenDetails } from '@nx-dapp/solana-dapp/balance/base';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
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
  map,
  mergeMap,
  observeOn,
  scan,
  shareReplay,
  switchMap,
  takeUntil,
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
  userAccounts$ = combineLatest([
    this.tokenAccounts$,
    this.nativeAccount$.pipe(isNotNull),
  ]).pipe(
    map(([tokenAccounts, nativeAccount]) => [...tokenAccounts, nativeAccount])
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
  ]).pipe(
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
  ]).pipe(
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
  ]).pipe(
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
            new LoadTokenAccountsAction({
              tokenAccounts: accounts.value
                .filter((info) => info.account.data.length > 0)
                .map((info) =>
                  TokenAccountParser(
                    new PublicKey(info.pubkey.toBase58()),
                    info.account
                  )
                ),
              walletPublicKey,
            })
        )
      )
    )
  );

  private loadMintAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(ofType<LoadMintTokensAction>('loadMintTokens')),
  ]).pipe(
    mergeMap(([{ payload: connection }, { payload: mintKeys }]) =>
      combineLatest(
        mintKeys.map((mintKey) =>
          from(defer(() => connection.getAccountInfo(mintKey))).pipe(
            isNotNull,
            map((account) => MintParser(mintKey, account))
          )
        )
      ).pipe(map((accounts) => new LoadMintAccountsAction(accounts)))
    )
  );

  constructor(mintTokens: TokenDetails[]) {
    this.runEffects([
      this.loadTokenAccounts$,
      this.loadNativeAccount$,
      this.accountChanged$,
      this.loadMintAccounts$,
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

  loadWalletPublicKey(publicKey: PublicKey) {
    this._dispatcher.next(new LoadWalletPublicKeyAction(publicKey));
  }

  loadWalletConnected(connected: boolean) {
    this._dispatcher.next(new LoadWalletConnectedAction(connected));
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
