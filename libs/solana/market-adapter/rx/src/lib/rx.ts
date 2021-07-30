import { ofType } from '@nx-dapp/shared/operators/of-type';
import { TokenAccount } from '@nx-dapp/solana/account-adapter/base';
import {
  asyncScheduler,
  BehaviorSubject,
  merge,
  Observable,
  Subject,
  combineLatest,
} from 'rxjs';
import {
  filter,
  map,
  observeOn,
  scan,
  shareReplay,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';

import {
  InitAction,
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

  /* private loadMarketMints$ = this.actions$.pipe(
    ofType<LoadUserAccountsAction>('loadUserAccounts'),
    withLatestFrom(this.state$),
    map(([{ payload: userAccounts }, { marketMints }]) => {
      const mints = userAccounts.map((a) => a.info.mint.toBase58());
      const newMints = [...new Set([...marketMints, ...mints]).values()];

      return { marketMints, newMints };
    }),
    filter(
      ({ marketMints, newMints }) => marketMints.length !== newMints.length
    ),
    map(({ newMints }) => new LoadMarketMintsAction(newMints))
  ); */

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

        console.log({ marketMints, newMints });

        return { marketMints, newMints };
      }
    ),
    filter(
      ({ marketMints, newMints }) => marketMints.length !== newMints.length
    ),
    map(({ newMints }) => new LoadMarketMintsAction(newMints))
  );

  constructor() {
    this.runEffects([this.loadMarketMints$]);
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this._destroy), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }

  loadUserAccounts(userAccounts: TokenAccount[]) {
    console.log('user accounts action');
    this._dispatcher.next(new LoadUserAccountsAction(userAccounts));
  }

  loadNativeAccount(nativeAccount: TokenAccount) {
    console.log('native account action');
    this._dispatcher.next(new LoadNativeAccountAction(nativeAccount));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
