import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { WalletName } from '@solana/wallet-adapter-wallets';

@Component({
  selector: 'nx-dapp-connect-wallet',
  template: `
    <header nxDappModalHeader class="mr-8">
      <h1>Connect wallet</h1>
      <p>Pick your option and press connect.</p>
    </header>

    <div class="flex flex-wrap justify-around gap-4">
      <button
        *ngFor="let wallet of wallets$ | async"
        (click)="onConnectWallet(wallet.name)"
        [nxDappFocus]="(selectedWallet$ | async) === wallet.name"
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

    <button
      mat-icon-button
      aria-label="Close connection attempt"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectWalletComponent {
  @HostBinding('class') class = 'block w-72 relative';
  wallets$ = this.walletStore.wallets$;
  selectedWallet$ = this.walletStore.selectedWallet$;

  constructor(
    private walletStore: WalletStore,
    private dialogRef: MatDialogRef<ConnectWalletComponent>
  ) {}

  onConnectWallet(walletName: WalletName) {
    this.walletStore.selectWallet(walletName);

    setTimeout(() => {
      this.walletStore.connect();
      this.dialogRef.close();
    });
  }
}
