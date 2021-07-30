import { ofType } from '@nx-dapp/shared/operators/of-type';
import { TokenAccount } from '@nx-dapp/solana/account-adapter/base';
import {
  asyncScheduler,
  BehaviorSubject,
  merge,
  Observable,
  Subject,
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

  private loadMarketMints$ = this.actions$.pipe(
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
    this._dispatcher.next(new LoadUserAccountsAction(userAccounts));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}