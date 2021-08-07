import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Network } from '@nx-dapp/solana-dapp/network';

@Component({
  selector: 'nx-dapp-connections-dropdown',
  template: `
    <mat-form-field appearance="fill">
      <mat-label>Environment</mat-label>
      <mat-select [formControl]="networkControl">
        <mat-option *ngFor="let network of networks" [value]="network">
          {{ network.name }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionsDropdownComponent implements OnInit {
  @Input() networks: Network[] | null = null;
  @Input() defaultNetwork: Network | null = null;
  networkControl = new FormControl();
  @Output() selectNetwork = this.networkControl.valueChanges;

  ngOnInit() {
    if (this.defaultNetwork) {
      this.networkControl.setValue(this.defaultNetwork);
    }
  }
}
