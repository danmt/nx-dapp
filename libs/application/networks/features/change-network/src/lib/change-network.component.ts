import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  Network,
  SolanaDappNetworkService,
  SolanaDappWalletService,
} from '@nx-dapp/solana-dapp/angular';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'nx-dapp-change-network',
  template: `
    <header nxDappModalHeader class="mr-8">
      <h1>Change network</h1>
      <p>Pick your option and press change.</p>
    </header>

    <div class="flex flex-col gap-2">
      <nx-dapp-networks-radio-group
        [networks]="networks"
        [network]="network$ | async"
        (networkSelected)="onNetworkSelected($event)"
      ></nx-dapp-networks-radio-group>

      <p class="text-warn m-0 text-center" *ngIf="connected$ | async">
        Changing the network will disconnect <br />
        you from the wallet.
      </p>

      <ng-container *ngrxLet="connected$ as connected">
        <button
          *ngrxLet="selectedNetwork$ as selectedNetwork"
          mat-stroked-button
          color="primary"
          class="uppercase w-full h-12"
          (click)="onChangeNetwork(connected, selectedNetwork!)"
          [disabled]="!selectedNetwork"
        >
          Change network
        </button>
      </ng-container>
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
  connected$ = this.walletService.connected$;

  constructor(
    private networkService: SolanaDappNetworkService,
    private walletService: SolanaDappWalletService,
    private dialogRef: MatDialogRef<ChangeNetworkComponent>
  ) {}

  onChangeNetwork(connected: boolean, network: Network) {
    if (
      !connected ||
      (connected &&
        confirm('Are you sure? This action will disconnect your wallet.'))
    ) {
      this.networkService.changeNetwork(network);
      this.dialogRef.close();
    }
  }

  onNetworkSelected(network: Network) {
    this._selectedNetwork.next(network);
  }
}
