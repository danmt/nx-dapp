import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  getAllEndpoints,
  getSelected as getSelectedEndpoint,
} from '@nx-dapp/shared/connection/data-access/endpoints';
import { WALLET_SERVICE } from '@nx-dapp/shared/wallet-adapter/provider';
import { WalletName } from '@nx-dapp/shared/wallet-adapter/base';
import { WalletService } from '@nx-dapp/shared/wallet-adapter/rx';
import {
  getPhantomWallet,
  getSolletWallet,
  getSolongWallet,
} from '@nx-dapp/shared/wallet-adapter/wallets';

import { init, selectEndpoint } from './app.actions';

@Component({
  selector: 'nx-dapp-root',
  template: `
    <header>
      <nx-dapp-wallets-dropdown
        [wallets]="wallets"
        [isConnected]="isConnected$ | async"
        (selectWallet)="onWalletSelected($event)"
        (connect)="onWalletConnect()"
        (disconnect)="onWalletDisconnect()"
      ></nx-dapp-wallets-dropdown>
      <ng-container *ngIf="endpoints$ | async as endpoints">
        <nx-dapp-connections-dropdown
          [endpoints]="endpoints"
          [endpoint]="endpoint$ | async"
          (endpointSelected)="onSelectEndpoint($event)"
        ></nx-dapp-connections-dropdown>
      </ng-container>
    </header>
    <h1>First Dapp</h1>
  `,
})
export class AppComponent implements OnInit {
  endpoints$ = this.store.select(getAllEndpoints);
  endpoint$ = this.store.select(getSelectedEndpoint);
  wallets = [getPhantomWallet(), getSolletWallet(), getSolongWallet()];
  isConnected$ = this.walletService.connected$;

  constructor(
    private store: Store,
    @Inject(WALLET_SERVICE) private walletService: WalletService
  ) {}

  ngOnInit() {
    this.store.dispatch(init());

    this.walletService.state$.subscribe((a) => console.log('state', a));
  }

  onSelectEndpoint(endpointId: string) {
    this.store.dispatch(selectEndpoint({ selectedId: endpointId }));
  }

  onWalletSelected(walletName: WalletName) {
    this.walletService.setWalletName(walletName);
  }

  onWalletConnect() {
    this.walletService.connect().subscribe();
  }

  onWalletDisconnect() {
    this.walletService.disconnect().subscribe();
  }
}
