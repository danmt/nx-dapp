import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
  Network,
  SolanaDappNetworkService,
  SolanaDappWalletService,
} from '@nx-dapp/solana-dapp/angular';
import { BehaviorSubject, Subject } from 'rxjs';
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
          (ngSubmit)="onChangeNetwork(connected, selectedNetwork!)"
        >
          <nx-dapp-networks-radio-group
            [networks]="networks"
            [network]="network$ | async"
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
  private readonly _selectedNetwork = new BehaviorSubject<Network | null>(null);
  @HostBinding('class') class = 'block relative w-64';
  networks = this.networkService.networks;
  network$ = this.networkService.network$;
  selectedNetwork$ = this._selectedNetwork.asObservable();
  connected$ = this.walletService.connected$;
  changeNetworkGroup = new FormGroup({
    selectedNetwork: new FormControl(null, [Validators.required]),
  });

  constructor(
    private networkService: SolanaDappNetworkService,
    private walletService: SolanaDappWalletService,
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
