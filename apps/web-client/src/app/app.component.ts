import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  getAllEndpoints,
  getSelected as getSelectedEndpoint,
} from '@nx-dapp/shared/connection/data-access/endpoints';
import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { ACCOUNT_SERVICE } from '@nx-dapp/solana/account-adapter/angular';
import { IAccountService } from '@nx-dapp/solana/account-adapter/rx';
import { BALANCE_SERVICE } from '@nx-dapp/solana/balance-adapter/angular';
import { IBalanceService } from '@nx-dapp/solana/balance-adapter/rx';
import { CONNECTION_SERVICE } from '@nx-dapp/solana/connection-adapter/angular';
import { IConnectionService } from '@nx-dapp/solana/connection-adapter/rx';
import { MARKET_SERVICE } from '@nx-dapp/solana/market-adapter/angular';
import { IMarketService } from '@nx-dapp/solana/market-adapter/rx';
import { WALLET_SERVICE } from '@nx-dapp/solana/wallet-adapter/angular';
import { WalletName } from '@nx-dapp/solana/wallet-adapter/base';
import { IWalletService } from '@nx-dapp/solana/wallet-adapter/rx';
import {
  getPhantomWallet,
  getSolletWallet,
  getSolongWallet,
} from '@nx-dapp/solana/wallet-adapter/wallets';
import { NATIVE_MINT } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { init, selectEndpoint } from './app.actions';

@Component({
  selector: 'nx-dapp-root',
  template: `
    <header>
      <nx-dapp-wallets-dropdown
        [wallets]="wallets"
        [isConnected]="isConnected$ | async"
        (changeWallet)="onChangeWallet($event)"
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
            {{ balance.tokenInUSD | currency }}
          </li>
        </ul>
      </section>
    </main>
  `,
})
export class AppComponent implements OnInit {
  endpoints$ = this.store.select(getAllEndpoints);
  endpoint$ = this.store.select(getSelectedEndpoint);
  wallets = [getPhantomWallet(), getSolletWallet(), getSolongWallet()];
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

    this.connectionService.onConnectionAccountChange$.subscribe((account) =>
      this.accountService.changeAccount(account)
    );

    this.accountService.userAccounts$.subscribe((userAccounts) => {
      this.marketService.loadUserAccounts(userAccounts);
      this.balanceService.loadUserAccounts(userAccounts);
    });

    this.accountService.nativeAccount$
      .pipe(isNotNull)
      .subscribe((nativeAccount) =>
        this.marketService.loadNativeAccount(nativeAccount)
      );

    this.accountService.getMintAccounts([
      new PublicKey('SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'),
      NATIVE_MINT,
      new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    ]);

    this.accountService.mintAccounts$.subscribe((mintAccounts) => {
      this.balanceService.loadMintAccounts(mintAccounts);
    });

    this.accountService.marketAccounts$.subscribe((marketAccounts) => {
      this.balanceService.loadMarketAccounts(marketAccounts);
    });

    this.marketService.marketByMint$.subscribe((marketByMint) => {
      this.balanceService.loadMarketByMint(marketByMint);
      this.accountService.loadMarketByMint(marketByMint);
    });

    this.accountService.marketMintAccounts$.subscribe((marketMintAccounts) =>
      this.balanceService.loadMarketMintAccounts(marketMintAccounts)
    );

    this.accountService.marketIndicatorAccounts$.subscribe(
      (marketIndicatorAccounts) =>
        this.balanceService.loadMarketIndicatorAccounts(marketIndicatorAccounts)
    );
  }

  onSelectEndpoint(endpointId: string) {
    this.store.dispatch(selectEndpoint({ selectedId: endpointId }));

    this.connectionService.setEndpoint(endpointId);
  }

  onChangeWallet(walletName: WalletName) {
    this.walletService.changeWallet(walletName);
  }

  onConnectWallet() {
    this.walletService.connect();
  }

  onDisconnectWallet() {
    this.walletService.disconnect();
  }
}
