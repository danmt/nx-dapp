import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { NetworksStore } from '@nx-dapp/application/networks/data-access/networks';
import { Network } from '@nx-dapp/solana-dapp/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'nx-dapp-change-network',
  template: `
    <header nxDappModalHeader class="mr-8">
      <h1>Change network</h1>
      <p>Pick your option and press change.</p>
    </header>

    <ng-container *ngrxLet="connected$ as connected">
      <ng-container *ngrxLet="selectedNetwork$ as selectedNetwork">
        <form
          class="flex flex-col gap-2"
          [formGroup]="changeNetworkGroup"
          (ngSubmit)="onChangeNetwork(connected)"
        >
          <nx-dapp-networks-radio-group
            [networks]="networks$ | async"
            [network]="selectedNetwork$ | async"
            (networkSelected)="onNetworkSelected($event)"
          ></nx-dapp-networks-radio-group>

          <p class="text-warn m-0 text-center" *ngIf="connected">
            Changing the network will disconnect <br />
            you from the wallet.
          </p>

          <button
            mat-stroked-button
            color="primary"
            class="uppercase w-full h-12"
            [disabled]="!selectedNetwork || changeNetworkGroup.invalid"
          >
            Change network
          </button>
        </form>
      </ng-container>
    </ng-container>

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
export class ChangeNetworkComponent implements OnInit, OnDestroy {
  private readonly _destroy = new Subject();
  @HostBinding('class') class = 'block relative w-64';
  networks$ = this.networksStore.networks$;
  selectedNetwork$ = this.networksStore.selectedNetwork$;
  connected$ = this.walletStore.connected$;
  changeNetworkGroup = new FormGroup({
    selectedNetwork: new FormControl(null, [Validators.required]),
  });

  constructor(
    private networksStore: NetworksStore,
    private walletStore: WalletStore,
    private dialogRef: MatDialogRef<ChangeNetworkComponent>
  ) {}

  ngOnInit() {
    this.selectedNetwork$
      .pipe(takeUntil(this._destroy))
      .subscribe((selectedNetwork) =>
        this.changeNetworkGroup.setValue({ selectedNetwork })
      );
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  onChangeNetwork(connected: boolean) {
    if (
      !connected ||
      (connected &&
        confirm('Are you sure? This action will disconnect your wallet.'))
    ) {
      this.networksStore.changeNetwork(
        this.changeNetworkGroup.get('selectedNetwork')?.value
      );
      this.dialogRef.close();
    }
  }

  onNetworkSelected(network: Network) {
    this.changeNetworkGroup.setValue({ selectedNetwork: network });
  }
}
