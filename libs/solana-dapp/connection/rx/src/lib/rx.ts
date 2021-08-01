import {
  asyncScheduler,
  BehaviorSubject,
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
  takeUntil,
} from 'rxjs/operators';

import {
  ConnectionAccountChangedAction,
  ConnectionSlotChangedAction,
  InitAction,
  SelectEndpointAction,
  SendConnectionAccountChangedAction,
  SendConnectionSlotChangedAction,
} from './actions';
import { fromAccountChangeEvent, fromSlotChangeEvent } from './operators';
import { connectionInitialState, reducer } from './state';
import { Action, IConnectionService } from './types';

export class ConnectionService implements IConnectionService {
  private readonly _destroy = new Subject();
  private readonly _dispatcher = new BehaviorSubject<Action>(new InitAction());
  actions$ = this._dispatcher.asObservable();
  state$ = this._dispatcher.pipe(
    scan(reducer, connectionInitialState),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  endpoints$ = this.state$.pipe(
    map(({ endpoints }) => endpoints),
    distinctUntilChanged()
  );
  selectedEndpoint$ = this.state$.pipe(
    map(({ selectedEndpoint }) => selectedEndpoint),
    distinctUntilChanged()
  );
  endpoint$ = this.state$.pipe(
    map(({ endpoint }) => endpoint),
    distinctUntilChanged()
  );
  env$ = this.endpoint$.pipe(
    map((endpoint) => endpoint?.name || null),
    distinctUntilChanged()
  );
  connection$ = this.state$.pipe(
    map(({ connection }) => connection),
    distinctUntilChanged()
  );
  connectionAccount$ = this.state$.pipe(
    map(({ connectionAccount }) => connectionAccount),
    distinctUntilChanged()
  );
  sendConnection$ = this.state$.pipe(
    map(({ sendConnection }) => sendConnection),
    distinctUntilChanged()
  );

  private onConnectionAccountChange$ = this.connection$.pipe(
    fromAccountChangeEvent,
    map((account) => new ConnectionAccountChangedAction(account))
  );

  private onConnectionSlotChange$ = this.connection$.pipe(
    fromSlotChangeEvent,
    map(() => new ConnectionSlotChangedAction())
  );

  private onSendConnectionAccountChange$ = this.sendConnection$.pipe(
    fromAccountChangeEvent,
    map(() => new SendConnectionAccountChangedAction())
  );

  private onSendConnectionSlotChange$ = this.sendConnection$.pipe(
    fromSlotChangeEvent,
    map(() => new SendConnectionSlotChangedAction())
  );

  constructor() {
    this.runEffects([
      this.onConnectionAccountChange$,
      this.onConnectionSlotChange$,
      this.onSendConnectionAccountChange$,
      this.onSendConnectionSlotChange$,
    ]);
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this._destroy), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }


  selectEndpoint(endpointId: string) {
    this._dispatcher.next(new SelectEndpointAction(endpointId));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
