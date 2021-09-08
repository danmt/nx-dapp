import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { BalancesStore } from '@nx-dapp/application/wallets/data-access/balances';
import { isNotNull } from '@nx-dapp/shared/utils/operators';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'nx-dapp-view-wallet',
  template: `
    <header nxDappModalHeader class="mr-8">
      <h1>Your wallet</h1>
      <p>This information comes from your wallet</p>
    </header>

    <div
      *ngIf="walletAddress$ | async as walletAddress"
      class="flex flex-col gap-4"
    >
      <div>
        <h2 class="mb-1 text-base text-primary">Your Address</h2>

        <nx-dapp-copyable-text [text]="walletAddress"></nx-dapp-copyable-text>

        <div class="flex justify-between items-center mb-2">
          <span>SOL Balance</span>
          <span
            *ngIf="walletBalance$ | async as balance"
            class="text-primary text-lg font-bold"
          >
            {{ balance.quantity }}
          </span>
        </div>
        <a
          [href]="'https://solscan.io/account/' + walletAddress"
          target="_blank"
          class="inline-block"
        >
          View in Solscan <mat-icon>open_in_new</mat-icon>
        </a>
      </div>

      <button
        mat-stroked-button
        color="primary"
        class="uppercase w-full h-12"
        (click)="onDisconnectWallet()"
      >
        <ng-container
          *ngIf="(disconnecting$ | async) === false; else disconnecting"
        >
          Disconnect
        </ng-container>
      </button>
    </div>

    <button
      mat-icon-button
      aria-label="Close wallet details"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>

    <ng-template #disconnecting>
      <mat-spinner color="primary" diameter="28" class="mx-auto"></mat-spinner>
    </ng-template>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewWalletComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'block relative w-64';
  private readonly _destroy = new Subject();
  disconnecting$ = this.walletStore.disconnecting$;
  walletAddress$ = this.walletStore.publicKey$.pipe(
    isNotNull,
    map((publicKey) => publicKey.toBase58())
  );
  walletBalance$ = this.balancesStore.walletBalance$;

  constructor(
    private balancesStore: BalancesStore,
    private walletStore: WalletStore,
    private dialogRef: MatDialogRef<ViewWalletComponent>
  ) {}

  ngOnInit() {
    this.walletStore.connected$
      .pipe(
        filter((connected) => !connected),
        takeUntil(this._destroy)
      )
      .subscribe(() => this.dialogRef.close());
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  onDisconnectWallet() {
    if (confirm('Are you sure? This action will disconnect your wallet.')) {
      this.walletStore.disconnect();
    }
  }
}
