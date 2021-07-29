import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  getAllEndpoints,
  getSelected as getSelectedEndpoint,
} from '@nx-dapp/shared/connection/data-access/endpoints';
import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { ACCOUNT_SERVICE } from '@nx-dapp/solana/account-adapter/angular';
import { IAccountService } from '@nx-dapp/solana/account-adapter/rx';
import { CONNECTION_SERVICE } from '@nx-dapp/solana/connection-adapter/angular';
import { IConnectionService } from '@nx-dapp/solana/connection-adapter/rx';
import { WALLET_SERVICE } from '@nx-dapp/solana/wallet-adapter/angular';
import { WalletName } from '@nx-dapp/solana/wallet-adapter/base';
import { IWalletService } from '@nx-dapp/solana/wallet-adapter/rx';
import {
  getPhantomWallet,
  getSolletWallet,
  getSolongWallet,
} from '@nx-dapp/solana/wallet-adapter/wallets';
import { combineLatest } from 'rxjs';

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
    @Inject(CONNECTION_SERVICE) private connectionService: IConnectionService,
    @Inject(ACCOUNT_SERVICE) private accountService: IAccountService
  ) {}

  ngOnInit() {
    this.accountService.actions$.subscribe((actions) =>
      console.log('actions', actions)
    );
    this.accountService.state$.subscribe((state) =>
      console.log('state', state)
    );

    this.store.dispatch(init());

    this.connectionService.connection$.subscribe((connection) =>
      this.accountService.loadConnection(connection)
    );

    this.walletService.publicKey$
      .pipe(isNotNull)
      .subscribe((publicKey) =>
        this.accountService.loadWalletPublicKey(publicKey)
      );

    this.walletService.connected$.subscribe((connected) =>
      this.accountService.loadWalletConnected(connected)
    );

    combineLatest([
      this.connectionService.connection$,
      this.walletService.publicKey$.pipe(isNotNull),
    ]).pipe();

    this.connectionService.onConnectionAccountChange$.subscribe((account) =>
      this.accountService.changeAccount(account)
    );
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
