import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { init, selectEndpoint } from './app.actions';
import {
  getAllEndpoints,
  getSelected as getSelectedEndpoint,
} from '@nx-dapp/shared/connection/data-access/endpoints';

@Component({
  selector: 'nx-dapp-root',
  template: `
    <header>
      <nx-dapp-wallets-dropdown></nx-dapp-wallets-dropdown>
      <ng-container *ngIf="endpoints$ | async as endpoints">
        <nx-dapp-connections-dropdown
          [endpoints]="endpoints"
          [endpoint]="endpoint$ | async"
          (endpointSelected)="onSelectEndpoint($event)"
        ></nx-dapp-connections-dropdown>
      </ng-container>
    </header>
    <h1>First Dapp</h1>
  `,
  styles: [``],
})
export class AppComponent implements OnInit {
  endpoints$ = this.store.select(getAllEndpoints);
  endpoint$ = this.store.select(getSelectedEndpoint);

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(init());
  }

  onSelectEndpoint(endpointId: string) {
    this.store.dispatch(selectEndpoint({ selectedId: endpointId }));
  }
}
