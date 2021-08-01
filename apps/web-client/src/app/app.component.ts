import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  getAllEndpoints,
  getSelected as getSelectedEndpoint,
} from '@nx-dapp/shared/connection/data-access/endpoints';
import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import {
  ACCOUNT_SERVICE,
  BALANCE_SERVICE,
  CONNECTION_SERVICE,
  IAccountService,
  IBalanceService,
  IConnectionService,
  IMarketService,
  IWalletService,
  MARKET_SERVICE,
  WALLET_SERVICE,
} from '@nx-dapp/solana-dapp/angular';
import { WalletName } from '@nx-dapp/solana-dapp/wallet/base';

import { init, selectEndpoint } from './app.actions';

@Component({
  selector: 'nx-dapp-root',
  template: `
    <header>
      <nx-dapp-wallets-dropdown
        [wallets]="wallets$ | async"
        [isConnected]="isConnected$ | async"
        (selectWallet)="onSelectWallet($event)"
        (connectWallet)="onConnectWallet()"
        (disconnectWallet)="onDisconnectWallet()"
      ></nx-dapp-wallets-dropdown>
      <ng-container *ngIf="endpoints$ | async as endpoints">
        <nx-dapp-connections-dropdown
          [endpoints]="endpoints"
          [endpoint]="endpoint$ | async"
          (selectEndpoint)="onSelectEndpoint($event)"
        ></nx-dapp-connections-dropdown>
      </ng-container>
    </header>

    <main>
      <h1>First Dapp</h1>

      <section>
        <h2>Total in USD: {{ totalInUSD$ | async | currency }}</h2>

        <ul>
          <li *ngFor="let balance of balances$ | async">
            {{ balance.tokenName }}: {{ balance.tokenQuantity }} ({{
              balance.tokenInUSD | currency
            }})
          </li>
        </ul>
      </section>
    </main>
  `,
})
export class AppComponent implements OnInit {
  endpoints$ = this.store.select(getAllEndpoints);
  endpoint$ = this.store.select(getSelectedEndpoint);
  wallets$ = this.walletService.wallets$;
  isConnected$ = this.walletService.connected$;
  balances$ = this.balanceService.balances$;
  totalInUSD$ = this.balanceService.totalInUSD$;

  constructor(
    private store: Store,
    @Inject(WALLET_SERVICE) private walletService: IWalletService,
    @Inject(CONNECTION_SERVICE) private connectionService: IConnectionService,
    @Inject(ACCOUNT_SERVICE) private accountService: IAccountService,
    @Inject(MARKET_SERVICE) private marketService: IMarketService,
    @Inject(BALANCE_SERVICE) private balanceService: IBalanceService
  ) {}

  ngOnInit() {
    this.store.dispatch(init());

    this.connectionService.connection$.subscribe((connection) => {
      this.accountService.loadConnection(connection);
      this.marketService.loadConnection(connection);
    });

    this.walletService.publicKey$
      .pipe(isNotNull)
      .subscribe((publicKey) =>
        this.accountService.loadWalletPublicKey(publicKey)
      );

    this.walletService.connected$.subscribe((connected) =>
      this.accountService.loadWalletConnected(connected)
    );

    this.connectionService.connectionAccount$
      .pipe(isNotNull)
      .subscribe((account) => this.accountService.changeAccount(account));

    this.accountService.userAccounts$.subscribe((userAccounts) => {
      this.marketService.loadUserAccounts(userAccounts);
      this.balanceService.loadUserAccounts(userAccounts);
    });

    this.accountService.nativeAccount$
      .pipe(isNotNull)
      .subscribe((nativeAccount) =>
        this.marketService.loadNativeAccount(nativeAccount)
      );

    this.accountService.mintAccounts$.subscribe((mintAccounts) =>
      this.balanceService.loadMintAccounts(mintAccounts)
    );

    this.marketService.marketAccounts$.subscribe((marketAccounts) =>
      this.balanceService.loadMarketAccounts(marketAccounts)
    );

    this.marketService.marketByMint$.subscribe((marketByMint) =>
      this.balanceService.loadMarketByMint(marketByMint)
    );

    this.marketService.marketMintAccounts$.subscribe((marketMintAccounts) =>
      this.balanceService.loadMarketMintAccounts(marketMintAccounts)
    );

    this.marketService.marketIndicatorAccounts$.subscribe(
      (marketIndicatorAccounts) =>
        this.balanceService.loadMarketIndicatorAccounts(marketIndicatorAccounts)
    );
  }

  onSelectEndpoint(endpointId: string) {
    this.store.dispatch(selectEndpoint({ selectedId: endpointId }));

    this.connectionService.selectEndpoint(endpointId);
  }

  onSelectWallet(walletName: WalletName) {
    this.walletService.selectWallet(walletName);
  }

  onConnectWallet() {
    this.walletService.connect();
  }

  onDisconnectWallet() {
    this.walletService.disconnect();
  }
}
