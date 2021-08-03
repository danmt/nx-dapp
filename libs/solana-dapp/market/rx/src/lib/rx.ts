import { ofType } from '@nx-dapp/shared/operators/of-type';
import { TokenAccount } from '@nx-dapp/solana-dapp/account/base';
import {
  getMarketAccounts,
  getMarketByMint,
  getMarketIndicatorAccounts,
  getMarketMintAccounts,
  getMintAccounts,
  TokenDetails,
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
  LoadMintAccountsAction,
  LoadMintTokensAction,
  LoadTokenAccountsAction,
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
  mintTokens$ = this.state$.pipe(
    map(({ mintTokens }) => mintTokens),
    distinctUntilChanged()
  );
  mintAccounts$ = this.state$.pipe(
    map(({ mintAccounts }) => mintAccounts),
    distinctUntilChanged()
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

  private loadMarketByMint$ = this.actions$.pipe(
    ofType<LoadMintAccountsAction>('loadMintAccounts'),
    map(
      ({ payload: mintAccounts }) =>
        new LoadMarketByMintAction(getMarketByMint(mintAccounts))
    )
  );

  private loadMarketAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(ofType<LoadMarketByMintAction>('loadMarketByMint')),
  ]).pipe(
    switchMap(([{ payload: connection }, { payload: marketByMint }]) =>
      getMarketAccounts(marketByMint, connection).pipe(
        map((marketAccounts) => new LoadMarketAccountsAction(marketAccounts))
      )
    )
  );

  private loadMarketMintAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(ofType<LoadMarketAccountsAction>('loadMarketAccounts')),
  ]).pipe(
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
  ]).pipe(
    switchMap(([{ payload: connection }, { payload: marketAccounts }]) =>
      getMarketIndicatorAccounts(connection, marketAccounts).pipe(
        map(
          (marketIndicatorAccounts) =>
            new LoadMarketIndicatorAccountsAction(marketIndicatorAccounts)
        )
      )
    )
  );

  private loadMintAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(ofType<LoadMintTokensAction>('loadMintTokens')),
  ]).pipe(
    switchMap(([{ payload: connection }, { payload: mintKeys }]) =>
      getMintAccounts(connection, mintKeys).pipe(
        map((mintAccounts) => new LoadMintAccountsAction(mintAccounts))
      )
    )
  );

  constructor(mintTokens: TokenDetails[]) {
    this.runEffects([
      this.loadMarketByMint$,
      this.loadMarketAccounts$,
      this.loadMarketMintAccounts$,
      this.loadMarketIndicatorAccounts$,
      this.loadMintAccounts$,
    ]);

    this.loadMintTokens(mintTokens);
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this._destroy), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }

  loadConnection(connection: Connection) {
    this._dispatcher.next(new LoadConnectionAction(connection));
  }

  loadTokenAccounts(tokenAccounts: Map<string, TokenAccount>) {
    this._dispatcher.next(new LoadTokenAccountsAction(tokenAccounts));
  }

  loadMintTokens(mintTokens: TokenDetails[]) {
    this._dispatcher.next(new LoadMintTokensAction(mintTokens));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
