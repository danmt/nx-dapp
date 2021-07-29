import { BehaviorSubject, merge } from 'rxjs';
import { distinctUntilChanged, map, scan, shareReplay } from 'rxjs/operators';

import { InitAction, SelectEndpointAction } from './actions';
import { fromAccountChangeEvent, fromSlotChangeEvent } from './operators';
import { connectionInitialState, reducer } from './state';
import { Action, IConnectionService } from './types';

export class ConnectionService implements IConnectionService {
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
  endpoint$ = this.state$.pipe(
    map(({ endpoint }) => endpoint),
    distinctUntilChanged()
  );
  chain$ = this.state$.pipe(
    map(
      ({ endpoints, endpoint: selectedEndpoint }) =>
        endpoints.find(({ endpoint }) => selectedEndpoint === endpoint) ||
        endpoints[0]
    ),
    distinctUntilChanged()
  );
  env$ = this.chain$.pipe(
    map(({ name }) => name),
    distinctUntilChanged()
  );
  connection$ = this.state$.pipe(
    map(({ connection }) => connection),
    distinctUntilChanged()
  );
  sendConnection$ = this.state$.pipe(
    map(({ sendConnection }) => sendConnection),
    distinctUntilChanged()
  );
  onConnectionAccountChange$ = this.connection$.pipe(fromAccountChangeEvent);
  onConnectionSlotChange$ = this.connection$.pipe(fromSlotChangeEvent);
  onSendConnectionAccountChange$ = this.sendConnection$.pipe(
    fromAccountChangeEvent
  );
  onSendConnectionSlotChange$ = this.sendConnection$.pipe(fromSlotChangeEvent);

  constructor() {
    merge([
      this.onConnectionAccountChange$,
      this.onConnectionSlotChange$,
      this.onSendConnectionAccountChange$,
      this.onSendConnectionSlotChange$,
    ]).subscribe();
  }

  setEndpoint(endpointId: string) {
    this._dispatcher.next(new SelectEndpointAction(endpointId));
  }
}
