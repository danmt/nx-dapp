import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  SolanaDappWalletService,
  WalletName,
} from '@nx-dapp/solana-dapp/angular';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'nx-dapp-connect-wallet',
  template: `
    <header nxDappModalHeader class="mr-8">
      <h1>Connect wallet</h1>
      <p>Pick your option and press connect.</p>
    </header>

    <div class="flex flex-col-reverse gap-8">
      <button
        mat-stroked-button
        color="primary"
        class="uppercase w-full h-12"
        [disabled]="(selectedWallet$ | async) === null"
        (click)="onConnectWallet()"
      >
        <ng-container *ngIf="(connecting$ | async) === false; else connecting">
          Connect
        </ng-container>
      </button>

      <div class="flex flex-wrap justify-around gap-4">
        <button
          *ngFor="let wallet of wallets$ | async"
          (click)="onWalletSelected(wallet.name)"
        >
          <figure
            class="w-24 h-24 p-4 opacity-30 hover:opacity-100"
            [ngClass]="{
              'opacity-100': (selectedWallet$ | async) === wallet.name
            }"
          >
            <img [src]="wallet.icon" class="w-4/5 h-4/5 mx-auto" alt="" />
            <figcaption class="mt-1 text-center">
              {{ wallet.name }}
            </figcaption>
          </figure>
        </button>
      </div>
    </div>

    <button
      mat-icon-button
      aria-label="Close connection attempt"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>

    <ng-template #connecting>
      <mat-spinner color="primary" diameter="28" class="mx-auto"></mat-spinner>
    </ng-template>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectWalletComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'block w-72 relative';
  private readonly _destroy = new Subject();
  wallets$ = this.walletService.wallets$;
  selectedWallet$ = this.walletService.selectedWallet$;
  connecting$ = this.walletService.connecting$;

  constructor(
    private walletService: SolanaDappWalletService,
    private dialogRef: MatDialogRef<ConnectWalletComponent>
  ) {}

  ngOnInit() {
    this.walletService.connected$
      .pipe(
        filter((connected) => connected),
        takeUntil(this._destroy)
      )
      .subscribe(() => this.dialogRef.close());
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  onWalletSelected(walletName: WalletName) {
    this.walletService.selectWallet(walletName);
  }

  onConnectWallet() {
    this.walletService.connect();
  }
}
