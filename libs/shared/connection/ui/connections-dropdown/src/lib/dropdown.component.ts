import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Endpoint } from '@nx-dapp/shared/connection/data-access/endpoints';

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
  @Output() selectEndpoint = this.endpointControl.valueChanges;
}
