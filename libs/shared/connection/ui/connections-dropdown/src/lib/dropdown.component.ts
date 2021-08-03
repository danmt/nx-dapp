import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { DEFAULT_NETWORK, Network } from '@nx-dapp/solana-dapp/connection/base';

@Component({
  selector: 'nx-dapp-connections-dropdown',
  template: `
    <mat-form-field appearance="fill">
      <mat-label>Environment</mat-label>
      <mat-select [formControl]="networkControl">
        <mat-option *ngFor="let network of networks" [value]="network.name">
          {{ network.name }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionsDropdownComponent {
  private readonly _defaultNetwork = DEFAULT_NETWORK;
  @Input() set network(value: Network | null) {
    this.networkControl.setValue(value ? value.name : this._defaultNetwork);
  }
  @Input() networks: Network[] = [];
  networkControl = new FormControl('');
  @Output() selectNetwork = this.networkControl.valueChanges;
}
