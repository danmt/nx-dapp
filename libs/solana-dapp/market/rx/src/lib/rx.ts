import { ofType } from '@nx-dapp/shared/operators/of-type';
import { TokenAccount } from '@nx-dapp/solana-dapp/account/base';
import {
  getMarketIndicators,
  getMarketMints,
  getMarkets,
} from '@nx-dapp/solana-dapp/market/base';
import { Connection } from '@solana/web3.js';
import {
  asyncScheduler,
  BehaviorSubject,
  merge,
  Observable,
  Subject,
  combineLatest,
} from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  observeOn,
  scan,
  shareReplay,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';

import {
  InitAction,
  LoadConnectionAction,
  LoadMarketAccountsAction,
  LoadMarketIndicatorAccountsAction,
  LoadMarketMintAccountsAction,
  LoadMarketMintsAction,
  LoadNativeAccountAction,
  LoadUserAccountsAction,
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

  private loadMarketMints$ = combineLatest([
    this.actions$.pipe(ofType<LoadNativeAccountAction>('loadNativeAccount')),
    this.actions$.pipe(ofType<LoadUserAccountsAction>('loadUserAccounts')),
  ]).pipe(
    withLatestFrom(this.state$),
    map(
      ([
        [{ payload: nativeAccount }, { payload: userAccounts }],
        { marketMints },
      ]) => {
        const mints = [...userAccounts, nativeAccount].map((a) =>
          a.info.mint.toBase58()
        );
        const newMints = [...new Set([...marketMints, ...mints]).values()];

        return { marketMints, newMints };
      }
    ),
    filter(
      ({ marketMints, newMints }) => marketMints.length !== newMints.length
    ),
    map(({ newMints }) => new LoadMarketMintsAction(newMints))
  );

  private loadMarketAccounts$ = this.actions$.pipe(
    ofType<LoadConnectionAction>('loadConnection'),
    switchMap(({ payload: connection }) =>
      this.marketByMint$.pipe(
        concatMap((marketByMint) =>
          getMarkets(marketByMint, connection).pipe(
            map(
              (marketAccounts) => new LoadMarketAccountsAction(marketAccounts)
            )
          )
        )
      )
    )
  );

  private loadMarketMintAccounts$ = this.actions$.pipe(
    ofType<LoadConnectionAction>('loadConnection'),
    switchMap(({ payload: connection }) =>
      combineLatest([this.marketAccounts$, this.marketByMint$]).pipe(
        concatMap(([marketAccounts, marketByMint]) =>
          getMarketMints(marketByMint, connection, marketAccounts).pipe(
            map(
              (marketMintAccounts) =>
                new LoadMarketMintAccountsAction(marketMintAccounts)
            )
          )
        )
      )
    )
  );

  private loadMarketIndicatorAccounts$ = this.actions$.pipe(
    ofType<LoadConnectionAction>('loadConnection'),
    switchMap(({ payload: connection }) =>
      combineLatest([this.marketAccounts$, this.marketByMint$]).pipe(
        concatMap(([marketAccounts, marketByMint]) =>
          getMarketIndicators(marketByMint, connection, marketAccounts).pipe(
            map(
              (marketIndicatorAccounts) =>
                new LoadMarketIndicatorAccountsAction(marketIndicatorAccounts)
            )
          )
        )
      )
    )
  );

  constructor() {
    this.runEffects([
      this.loadMarketMints$,
      this.loadMarketAccounts$,
      this.loadMarketMintAccounts$,
      this.loadMarketIndicatorAccounts$,
    ]);
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this._destroy), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }

  loadUserAccounts(userAccounts: TokenAccount[]) {
    this._dispatcher.next(new LoadUserAccountsAction(userAccounts));
  }

  loadNativeAccount(nativeAccount: TokenAccount) {
    this._dispatcher.next(new LoadNativeAccountAction(nativeAccount));
  }

  loadConnection(connection: Connection) {
    this._dispatcher.next(new LoadConnectionAction(connection));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
