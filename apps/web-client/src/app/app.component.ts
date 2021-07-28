import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CONNECTION_SERVICE } from '@nx-dapp/solana/connection-adapter/angular';
import { ConnectionService } from '@nx-dapp/solana/connection-adapter/rx';
import {
  getAllEndpoints,
  getSelected as getSelectedEndpoint,
} from '@nx-dapp/shared/connection/data-access/endpoints';
import { WALLET_SERVICE } from '@nx-dapp/solana/wallet-adapter/angular';
import { WalletName } from '@nx-dapp/solana/wallet-adapter/base';
import { IWalletService } from '@nx-dapp/solana/wallet-adapter/rx';
import {
  getPhantomWallet,
  getSolletWallet,
  getSolongWallet,
} from '@nx-dapp/solana/wallet-adapter/wallets';

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
    @Inject(WALLET_SERVICE) private walletService: IWalletService,
    @Inject(CONNECTION_SERVICE) private connectionService: ConnectionService
  ) {}

  ngOnInit() {
    this.store.dispatch(init());
  }

  onSelectEndpoint(endpointId: string) {
    this.store.dispatch(selectEndpoint({ selectedId: endpointId }));

    this.connectionService.setEndpoint(endpointId);
  }

  onWalletSelected(walletName: WalletName) {
    this.walletService.selectWallet(walletName);
  }

  onWalletConnect() {
    this.walletService.connect().subscribe();
  }

  onWalletDisconnect() {
    this.walletService.disconnect().subscribe();
  }
}
