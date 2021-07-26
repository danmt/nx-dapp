import { Injectable } from '@angular/core';
import { createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  Endpoint,
  getSelected as getSelectedEndpoint,
} from '@nx-dapp/shared/connection/data-access/endpoints';
import { filter, tap } from 'rxjs/operators';

import { ConnectionsService } from '../connections.service';

@Injectable()
export class ConnectionsEffects {
  connectionsList$ = createEffect(
    () =>
      this.store.select(getSelectedEndpoint).pipe(
        filter((value: Endpoint | null): value is Endpoint => value !== null),
        tap((endpoint) => {
          this.connectionsService.setConnection(endpoint.url);
          this.connectionsService.setSendConnection(endpoint.url);
        })
      ),
    { dispatch: false }
  );

  constructor(
    private store: Store,
    private connectionsService: ConnectionsService
  ) {}
}
