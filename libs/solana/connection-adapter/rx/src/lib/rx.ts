import { BehaviorSubject, merge } from 'rxjs';
import { map, scan, shareReplay } from 'rxjs/operators';

import { Action, InitAction, SelectEndpointAction } from './actions';
import { fromAccountChangeEvent, fromSlotChangeEvent } from './operators';
import { connectionInitialState, reducer } from './state';

export class ConnectionService {
  private readonly _dispatcher = new BehaviorSubject<Action>(new InitAction());
  actions$ = this._dispatcher.asObservable();
  state$ = this._dispatcher.pipe(
    scan(reducer, connectionInitialState),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  endpoints$ = this.state$.pipe(map(({ endpoints }) => endpoints));
  endpoint$ = this.state$.pipe(map(({ endpoint }) => endpoint));
  chain$ = this.state$.pipe(
    map(
      ({ endpoints, endpoint: selectedEndpoint }) =>
        endpoints.find(({ endpoint }) => selectedEndpoint === endpoint) ||
        endpoints[0]
    )
  );
  env$ = this.chain$.pipe(map(({ name }) => name));
  connection$ = this.state$.pipe(map(({ connection }) => connection));
  sendConnection$ = this.state$.pipe(
    map(({ sendConnection }) => sendConnection)
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
