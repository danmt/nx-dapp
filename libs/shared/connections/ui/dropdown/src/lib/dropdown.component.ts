import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  ENV as ChainID,
  TokenInfo,
  TokenListProvider,
} from '@solana/spl-token-registry';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { defer, from } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import {
  Endpoint,
  ENV,
} from '@nx-dapp/shared/connections/data-access/endpoints';

@Component({
  selector: 'nx-dapp-connections-dropdown',
  template: `
    <mat-form-field appearance="fill">
      <mat-label>Environment</mat-label>
      <mat-select [formControl]="endpointControl">
        <mat-option *ngFor="let endpoint of endpoints" [value]="endpoint.id">
          {{ endpoint.id }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionsDropdownComponent {
  private readonly _defaultEndpoint = 'mainnet-beta';
  @Input() endpoint: Endpoint | null = null;
  @Input() endpoints: Endpoint[] = [];
  endpointControl = new FormControl(
    this.endpoint ? this.endpoint.id : this._defaultEndpoint
  );
  @Output() endpointSelected = this.endpointControl.valueChanges;

  // WIP: Remove this part down here
  chain$ = this.endpointControl.valueChanges.pipe(
    startWith(this._defaultEndpoint),
    map(
      (endpointId: string) =>
        this.endpoints.find((endpoint) => endpoint.id === endpointId) ||
        this.endpoints[0]
    )
  );
  connections$ = this.chain$.pipe(
    map((chain) => ({
      connection: new Connection(chain.url, 'recent'),
      sendConnection: new Connection(chain.url, 'recent'),
    }))
  );
  connection$ = this.connections$.pipe(map(({ connection }) => connection));
  sendConnection$ = this.connections$.pipe(
    map(({ sendConnection }) => sendConnection)
  );
}
