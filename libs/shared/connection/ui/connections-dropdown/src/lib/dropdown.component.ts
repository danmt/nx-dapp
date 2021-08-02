import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Network } from '@nx-dapp/solana-dapp/connection/base';

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
  private readonly _defaultNetwork = 'mainnet-beta';
  @Input() network: Network | null = null;
  @Input() networks: Network[] = [];
  networkControl = new FormControl(
    this.network ? this.network.name : this._defaultNetwork
  );
  @Output() selectNetwork = this.networkControl.valueChanges;
}
