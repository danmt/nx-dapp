import { Component, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { isNotNull } from '@nx-dapp/shared/utils/operators';
import { Network } from '@nx-dapp/solana-dapp/angular';

@Component({
  selector: 'nx-dapp-networks-radio-group',
  template: `
    <mat-radio-group [formControl]="networkControl">
      <mat-radio-button
        *ngFor="let network of networks"
        [value]="network"
        class="w-full"
      >
        <div class="ml-4 py-2 flex flex-col gap-1">
          <p class="uppercase m-0">{{ network.name }}</p>
          <p class="text-opacity-25 text-xs italic truncate text-primary m-0">
            {{ network.url }}
          </p>
        </div>
      </mat-radio-button>
    </mat-radio-group>
  `,
  styles: [],
})
export class NetworksRadioGroupComponent {
  @Input() networks: Network[] | null = null;
  @Input() set network(value: Network | null) {
    this.networkControl.setValue(value, { emitEvent: false });
  }
  networkControl = new FormControl(null);
  @Output() networkSelected = this.networkControl.valueChanges.pipe(isNotNull);
}
