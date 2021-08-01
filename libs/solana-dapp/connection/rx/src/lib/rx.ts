import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { ofType } from '@nx-dapp/shared/operators/of-type';
import { Endpoint, getTokens } from '@nx-dapp/solana-dapp/connection/base';
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
  ConnectionAccountChangedAction,
  ConnectionSlotChangedAction,
  InitAction,
  LoadConnectionAction,
  LoadEndpointAction,
  LoadEndpointsAction,
  LoadSendConnectionAction,
  LoadTokensAction,
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
  tokens$ = this.state$.pipe(
    map(({ tokens }) => tokens),
    distinctUntilChanged()
  );

  private connectionAccountChange$ = this.connection$.pipe(
    fromAccountChangeEvent,
    map((account) => new ConnectionAccountChangedAction(account))
  );

  private connectionSlotChange$ = this.connection$.pipe(
    fromSlotChangeEvent,
    map(() => new ConnectionSlotChangedAction())
  );

  private sendConnectionAccountChange$ = this.sendConnection$.pipe(
    fromAccountChangeEvent,
    map(() => new SendConnectionAccountChangedAction())
  );

  private sendConnectionSlotChange$ = this.sendConnection$.pipe(
    fromSlotChangeEvent,
    map(() => new SendConnectionSlotChangedAction())
  );

  private loadEndpoint$ = combineLatest([
    this.actions$.pipe(ofType<SelectEndpointAction>('selectEndpoint')),
    this.actions$.pipe(ofType<LoadEndpointsAction>('loadEndpoints')),
  ]).pipe(
    map(
      ([{ payload: selectedEndpoint }, { payload: endpoints }]) =>
        endpoints.find(({ endpoint }) => selectedEndpoint === endpoint) || null
    ),
    isNotNull,
    map((endpoint) => new LoadEndpointAction(endpoint))
  );

  private loadConnection$ = this.actions$.pipe(
    ofType<LoadEndpointAction>('loadEndpoint'),
    map(
      ({ payload: { endpoint } }) =>
        new LoadConnectionAction(new Connection(endpoint, 'recent'))
    )
  );

  private loadSendConnection$ = this.actions$.pipe(
    ofType<LoadEndpointAction>('loadEndpoint'),
    map(
      ({ payload: { endpoint } }) =>
        new LoadSendConnectionAction(new Connection(endpoint, 'recent'))
    )
  );

  private loadTokens$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(ofType<LoadEndpointAction>('loadEndpoint')),
  ]).pipe(
    switchMap(([, { payload: endpoint }]) =>
      getTokens(endpoint).pipe(map((tokens) => new LoadTokensAction(tokens)))
    )
  );

  constructor(endpoints: Endpoint[], defaultEndpoint: string) {
    this.runEffects([
      this.connectionAccountChange$,
      this.connectionSlotChange$,
      this.sendConnectionAccountChange$,
      this.sendConnectionSlotChange$,
      this.loadEndpoint$,
      this.loadConnection$,
      this.loadSendConnection$,
      this.loadTokens$,
    ]);

    this.loadEndpoints(endpoints);
    this.selectEndpoint(defaultEndpoint);
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this._destroy), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }

  loadEndpoints(endpoints: Endpoint[]) {
    this._dispatcher.next(new LoadEndpointsAction(endpoints));
  }

  selectEndpoint(endpointId: string) {
    this._dispatcher.next(new SelectEndpointAction(endpointId));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
