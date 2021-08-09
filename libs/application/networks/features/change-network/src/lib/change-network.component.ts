import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  Network,
  SolanaDappNetworkService,
} from '@nx-dapp/solana-dapp/angular';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'nx-dapp-change-network',
  template: `
    <header nxDappModalHeader class="mr-8">
      <h1>Change network</h1>
      <p>Pick your option and press change.</p>
    </header>

    <div class="flex flex-col gap-8">
      <nx-dapp-networks-radio-group
        [networks]="networks"
        [network]="network$ | async"
        (networkSelected)="onNetworkSelected($event)"
      ></nx-dapp-networks-radio-group>

      <button
        *ngrxLet="selectedNetwork$ as selectedNetwork"
        mat-stroked-button
        color="primary"
        class="uppercase w-full h-12"
        (click)="onChangeNetwork(selectedNetwork!)"
        [disabled]="!selectedNetwork"
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
  private readonly _selectedNetwork = new BehaviorSubject<Network | null>(null);
  @HostBinding('class') class = 'block relative w-64';
  networks = this.networkService.networks;
  network$ = this.networkService.network$;
  selectedNetwork$ = this._selectedNetwork.asObservable();

  constructor(
    private networkService: SolanaDappNetworkService,
    private dialogRef: MatDialogRef<ChangeNetworkComponent>
  ) {}

  onChangeNetwork(network: Network) {
    this.networkService.changeNetwork(network);
    this.dialogRef.close();
  }

  onNetworkSelected(network: Network) {
    this._selectedNetwork.next(network);
  }
}
