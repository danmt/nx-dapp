import { FocusMonitor } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import {
  SolanaDappBalanceService,
  SolanaDappWalletService,
} from '@nx-dapp/solana-dapp/angular';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

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

        <div
          class="bg-black bg-opacity-25 rounded-md px-3 py-1 flex items-center mb-2"
        >
          <p class="m-0 truncate flex-shrink">
            {{ walletAddress }}
          </p>

          <button
            id="copy-tooltip"
            mat-mini-fab
            color="primary"
            class="scale-75"
            #tooltip="matTooltip"
            matTooltip="Copied!"
            matTooltipPosition="above"
            [cdkCopyToClipboard]="walletAddress"
            [matTooltipDisabled]="(copied$ | async) === false"
            (click)="onCopyAddress(tooltip)"
          >
            <mat-icon>content_copy</mat-icon>
          </button>
        </div>

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
  styles: [
    `
      .copy-button > .mat-button-wrapper {
        padding: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewWalletComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'block relative w-60';
  private readonly _destroy = new Subject();
  private readonly _copied = new BehaviorSubject(false);
  disconnecting$ = this.walletService.disconnecting$;
  walletAddress$ = this.walletService.walletAddress$;
  walletBalance$ = this.balanceService.getBalanceForWallet();
  copied$ = this._copied.asObservable();

  constructor(
    private walletService: SolanaDappWalletService,
    private balanceService: SolanaDappBalanceService,
    private dialogRef: MatDialogRef<ViewWalletComponent>,
    private focusMonitor: FocusMonitor
  ) {}

  ngOnInit() {
    this.walletService.connected$
      .pipe(
        filter((connected) => !connected),
        takeUntil(this._destroy)
      )
      .subscribe(() => this.dialogRef.close());

    const copyTooltipElement = document.getElementById('copy-tooltip');

    if (copyTooltipElement) {
      this.focusMonitor.stopMonitoring(copyTooltipElement);
    }
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  onDisconnectWallet() {
    this.walletService.disconnect();
  }

  onCopyAddress(tooltip: MatTooltip) {
    this._copied.next(true);

    setTimeout(() => tooltip.show());
    setTimeout(() => {
      tooltip.hide();
      this._copied.next(false);
    }, 2000);
  }
}
