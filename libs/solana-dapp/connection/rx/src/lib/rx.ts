import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { ofType } from '@nx-dapp/shared/operators/of-type';
import { Network } from '@nx-dapp/solana-dapp/connection/base';
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
  takeUntil,
} from 'rxjs/operators';

import {
  ConnectionAccountChangedAction,
  ConnectionSlotChangedAction,
  InitAction,
  LoadConnectionAction,
  LoadNetworkAction,
  LoadNetworksAction,
  LoadSendConnectionAction,
  SelectNetworkAction,
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
  networks$ = this.state$.pipe(
    map(({ networks }) => networks),
    distinctUntilChanged()
  );
  selectedNetwork$ = this.state$.pipe(
    map(({ selectedNetwork }) => selectedNetwork),
    distinctUntilChanged()
  );
  network$ = this.state$.pipe(
    map(({ network }) => network),
    distinctUntilChanged()
  );
  env$ = this.network$.pipe(
    map((network) => network?.name || null),
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

  private loadNetwork$ = combineLatest([
    this.actions$.pipe(ofType<SelectNetworkAction>('selectNetwork')),
    this.actions$.pipe(ofType<LoadNetworksAction>('loadNetworks')),
  ]).pipe(
    map(
      ([{ payload: selectedNetwork }, { payload: networks }]) =>
        networks.find(({ name }) => selectedNetwork === name) || null
    ),
    isNotNull,
    map((network) => new LoadNetworkAction(network))
  );

  private loadConnection$ = this.actions$.pipe(
    ofType<LoadNetworkAction>('loadNetwork'),
    map(
      ({ payload: { url } }) =>
        new LoadConnectionAction(new Connection(url, 'recent'))
    )
  );

  private loadSendConnection$ = this.actions$.pipe(
    ofType<LoadNetworkAction>('loadNetwork'),
    map(
      ({ payload: { url } }) =>
        new LoadSendConnectionAction(new Connection(url, 'recent'))
    )
  );

  constructor(networks: Network[], defaultNetwork: string) {
    this.runEffects([
      this.connectionAccountChange$,
      this.connectionSlotChange$,
      this.sendConnectionAccountChange$,
      this.sendConnectionSlotChange$,
      this.loadNetwork$,
      this.loadConnection$,
      this.loadSendConnection$,
    ]);

    setTimeout(() => {
      this.selectNetwork(defaultNetwork);
      this.loadNetworks(networks);
    });
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this._destroy), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }

  loadNetworks(networks: Network[]) {
    this._dispatcher.next(new LoadNetworksAction(networks));
  }

  selectNetwork(networkId: string) {
    this._dispatcher.next(new SelectNetworkAction(networkId));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
