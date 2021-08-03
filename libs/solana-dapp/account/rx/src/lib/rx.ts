import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { ofType } from '@nx-dapp/shared/operators/of-type';
import {
  getTokenAccounts,
  TokenAccountParser,
  wrapNativeAccount,
} from '@nx-dapp/solana-dapp/account/base';
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
      getTokenAccounts(connection, walletPublicKey).pipe(
        map((tokenAccounts) => new LoadTokenAccountsAction(tokenAccounts))
      )
    )
  );

  private reset$ = this.actions$.pipe(
    ofType<LoadWalletConnectedAction>('loadWalletConnected'),
    filter(({ payload: walletConnected }) => !walletConnected),
    map(() => new ResetAction())
  );

  constructor() {
    this.runEffects([
      this.loadTokenAccounts$,
      this.loadNativeAccount$,
      this.accountChanged$,
      this.reset$,
    ]);
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

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
