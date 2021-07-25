import { ChangeDetectionStrategy, Component } from '@angular/core';
import WalletAdapter from '@project-serum/sol-wallet-adapter';
import { BehaviorSubject } from 'rxjs';

import { PhantomWalletAdapter, SolongWalletAdapter } from './adapters';
import { Wallet } from './interfaces';

@Component({
  selector: 'nx-dapp-connect-dropdown',
  template: `
    <button
      mat-raised-button
      color="primary"
      *ngIf="wallet$ | async as wallet"
      (click)="disconnect(wallet)"
    >
      Disconnect
    </button>
    <button
      mat-raised-button
      color="primary"
      [matMenuTriggerFor]="menu"
      *ngIf="(wallet$ | async) === null"
    >
      Connect
    </button>
    <mat-menu #menu="matMenu">
      <ng-container *ngFor="let wallet of wallets">
        <nx-dapp-connect-provider
          *ngIf="wallet.adapter"
          [label]="wallet.label"
          [icon]="wallet.icon"
          [url]="wallet.url"
          [adapter]="wallet.adapter"
          (connected)="onConnected($event)"
        >
        </nx-dapp-connect-provider>
      </ng-container>
    </mat-menu>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectDropdownComponent {
  wallets = [
    {
      label: 'Sollet',
      icon: 'https://raw.githubusercontent.com/solana-labs/oyster/main/assets/wallets/sollet.svg',
      url: 'https://www.sollet.io',
      adapter: new WalletAdapter(
        'https://www.sollet.io',
        'https://solana-api.projectserum.com/'
      ),
    },
    {
      label: 'Phantom',
      icon: 'https://raydium.io/_nuxt/img/phantom.d9e3c61.png',
      url: 'https://phantom.app/',
      adapter: new PhantomWalletAdapter(),
    },
    {
      label: 'Solong',
      url: 'https://solongwallet.com',
      icon: 'https://raw.githubusercontent.com/solana-labs/oyster/main/assets/wallets/solong.png',
      adapter: new SolongWalletAdapter(),
    },
  ];
  private _wallet = new BehaviorSubject<Wallet | null>(null);
  wallet$ = this._wallet.asObservable();

  async disconnect(wallet: Wallet) {
    await wallet.disconnect();
    this._wallet.next(null);
  }

  onConnected(wallet: Wallet) {
    this._wallet.next(wallet);
  }
}
