import { ofType } from '@nx-dapp/shared/operators/of-type';
import { TokenAccount } from '@nx-dapp/solana-dapp/account/base';
import {
  getMarketAccounts,
  getMarketByMint,
  getMarketIndicatorAccounts,
  getMarketMintAccounts,
} from '@nx-dapp/solana-dapp/market/base';
import { Connection } from '@solana/web3.js';
import {
  asyncScheduler,
  BehaviorSubject,
  combineLatest,
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
  InitAction,
  LoadConnectionAction,
  LoadMarketAccountsAction,
  LoadMarketByMintAction,
  LoadMarketIndicatorAccountsAction,
  LoadMarketMintAccountsAction,
  LoadNativeAccountAction,
  LoadTokenAccountsAction,
  LoadWalletConnectedAction,
  ResetAction,
} from './actions';
import { marketInitialState, reducer } from './state';
import { Action, IMarketService } from './types';

export class MarketService implements IMarketService {
  private readonly _destroy = new Subject();
  private readonly _dispatcher = new BehaviorSubject<Action>(new InitAction());
  actions$ = this._dispatcher.asObservable();
  state$ = this._dispatcher.pipe(
    scan(reducer, marketInitialState),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  marketByMint$ = this.state$.pipe(
    map(({ marketByMint }) => marketByMint),
    distinctUntilChanged()
  );
  marketAccounts$ = this.state$.pipe(
    map(({ marketAccounts }) => marketAccounts),
    distinctUntilChanged()
  );
  marketMintAccounts$ = this.state$.pipe(
    map(({ marketMintAccounts }) => marketMintAccounts),
    distinctUntilChanged()
  );
  marketIndicatorAccounts$ = this.state$.pipe(
    map(({ marketIndicatorAccounts }) => marketIndicatorAccounts),
    distinctUntilChanged()
  );

  private loadMarketByMint$ = combineLatest([
    this.actions$.pipe(ofType<LoadTokenAccountsAction>('loadTokenAccounts')),
    this.actions$.pipe(
      ofType<LoadWalletConnectedAction>('loadWalletConnected')
    ),
  ]).pipe(
    filter(([, { payload: walletConnected }]) => walletConnected),
    map(
      ([{ payload: tokenAccounts }]) =>
        new LoadMarketByMintAction(getMarketByMint(tokenAccounts))
    )
  );

  private loadMarketAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(ofType<LoadMarketByMintAction>('loadMarketByMint')),
    this.actions$.pipe(
      ofType<LoadWalletConnectedAction>('loadWalletConnected')
    ),
  ]).pipe(
    filter(([, , { payload: walletConnected }]) => walletConnected),
    switchMap(([{ payload: connection }, { payload: marketByMint }]) =>
      getMarketAccounts(marketByMint, connection).pipe(
        map((marketAccounts) => new LoadMarketAccountsAction(marketAccounts))
      )
    )
  );

  private loadMarketMintAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(ofType<LoadMarketAccountsAction>('loadMarketAccounts')),
    this.actions$.pipe(
      ofType<LoadWalletConnectedAction>('loadWalletConnected')
    ),
  ]).pipe(
    filter(([, , { payload: walletConnected }]) => walletConnected),
    switchMap(([{ payload: connection }, { payload: marketAccounts }]) =>
      getMarketMintAccounts(connection, marketAccounts).pipe(
        map(
          (marketMintAccounts) =>
            new LoadMarketMintAccountsAction(marketMintAccounts)
        )
      )
    )
  );

  private loadMarketIndicatorAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(ofType<LoadMarketAccountsAction>('loadMarketAccounts')),
    this.actions$.pipe(
      ofType<LoadWalletConnectedAction>('loadWalletConnected')
    ),
  ]).pipe(
    filter(([, , { payload: walletConnected }]) => walletConnected),
    switchMap(([{ payload: connection }, { payload: marketAccounts }]) =>
      getMarketIndicatorAccounts(connection, marketAccounts).pipe(
        map(
          (marketIndicatorAccounts) =>
            new LoadMarketIndicatorAccountsAction(marketIndicatorAccounts)
        )
      )
    )
  );

  private reset$ = this.actions$.pipe(
    ofType<LoadWalletConnectedAction>('loadWalletConnected'),
    filter(({ payload: connected }) => !connected),
    map(() => new ResetAction())
  );

  constructor() {
    this.runEffects([
      this.loadMarketByMint$,
      this.loadMarketAccounts$,
      this.loadMarketMintAccounts$,
      this.loadMarketIndicatorAccounts$,
      this.reset$,
    ]);
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this._destroy), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }

  loadTokenAccounts(tokenAccounts: Map<string, TokenAccount>) {
    this._dispatcher.next(new LoadTokenAccountsAction(tokenAccounts));
  }

  loadNativeAccount(nativeAccount: TokenAccount) {
    this._dispatcher.next(new LoadNativeAccountAction(nativeAccount));
  }

  loadConnection(connection: Connection) {
    this._dispatcher.next(new LoadConnectionAction(connection));
  }

  loadWalletConnected(walletConnected: boolean) {
    this._dispatcher.next(new LoadWalletConnectedAction(walletConnected));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
