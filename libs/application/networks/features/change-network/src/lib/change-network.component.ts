import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SolanaDappNetworkService } from '@nx-dapp/solana-dapp/angular';

@Component({
  selector: 'nx-dapp-change-network',
  template: `
    <header nxDappModalHeader class="mr-8">
      <h1>Change network</h1>
      <p>Pick your option and press change.</p>
    </header>

    <div class="flex flex-col gap-8">
      <mat-radio-group [formControl]="networkControl">
        <mat-radio-button
          *ngFor="let network of networks"
          [value]="network"
          class="w-full"
        >
          <div class="ml-4 py-4 flex flex-col gap-1">
            <p class="uppercase m-0">{{ network.name }}</p>
            <p class="text-opacity-25 text-xs italic truncate text-primary m-0">
              {{ network.url }}
            </p>
          </div>
        </mat-radio-button>
      </mat-radio-group>

      <button
        mat-stroked-button
        color="primary"
        class="uppercase w-full h-12"
        (click)="onChangeNetwork()"
      >
        Change network
      </button>
    </div>

    <button
      mat-icon-button
      aria-label="Close change network"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeNetworkComponent {
  @HostBinding('class') class = 'block relative w-64';
  networks = this.networkService.networks;
  networkControl = new FormControl(this.networkService.networks[0]);

  constructor(
    private networkService: SolanaDappNetworkService,
    private dialogRef: MatDialogRef<ChangeNetworkComponent>
  ) {}

  onChangeNetwork() {
    this.networkService.changeNetwork(this.networkControl.value);
    this.dialogRef.close();
  }
}
