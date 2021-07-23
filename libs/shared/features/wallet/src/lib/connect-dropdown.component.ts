import { ChangeDetectionStrategy, Component } from '@angular/core';

const ASSETS_URL =
  'https://raw.githubusercontent.com/solana-labs/oyster/main/assets/wallets';

const WALLET_PROVIDERS = [
  {
    title: 'Sollet',
    icon: `${ASSETS_URL}/sollet.svg`,
  },
  {
    title: 'Phantom',
    icon: `https://raydium.io/_nuxt/img/phantom.d9e3c61.png`,
  },
];

@Component({
  selector: 'nx-dapp-connect-dropdown',
  template: `
    <button mat-raised-button color="primary" [matMenuTriggerFor]="menu">
      Connect
    </button>
    <mat-menu #menu="matMenu">
      <button
        mat-menu-item
        *ngFor="let provider of walletProviders"
        class="flex items-center"
      >
        <img class="inline-block w-6 h-6 mr-2" [src]="provider.icon" />

        {{ provider.title }}
      </button>
    </mat-menu>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectDropdownComponent {
  walletProviders = WALLET_PROVIDERS;
}
