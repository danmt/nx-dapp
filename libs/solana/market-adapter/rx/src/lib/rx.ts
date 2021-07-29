import {
  asyncScheduler,
  BehaviorSubject,
  merge,
  Observable,
  Subject,
} from 'rxjs';
import { observeOn, scan, shareReplay, takeUntil } from 'rxjs/operators';

import { InitAction } from './actions';
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

  constructor() {
    this.runEffects([]);
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this._destroy), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }
  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
