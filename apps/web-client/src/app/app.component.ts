import { Component, Inject, OnInit } from '@angular/core';
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
      <ng-container *ngIf="networks$ | async as networks">
        <nx-dapp-connections-dropdown
          [networks]="networks"
          [network]="network$ | async"
          (selectNetwork)="onSelectNetwork($event)"
        ></nx-dapp-connections-dropdown>
      </ng-container>
    </header>

    <main>
      <h1>First Dapp</h1>

      <section>
        <h2>Total in USD: {{ totalInUSD$ | async | currency }}</h2>

        <ul>
          <ng-container *ngFor="let balance of balances$ | async">
            <li *ngIf="balance.hasBalance" class="flex p-2 mb-1 items-center">
              <figure class="block w-6 h-6 mr-2">
                <img class="w-full h-full" [src]="balance.tokenLogo" />
              </figure>
              <div>
                {{ balance.tokenName }} ({{ balance.tokenSymbol }}):
                {{ balance.tokenQuantity }} ({{
                  balance.tokenInUSD | currency
                }})
              </div>
            </li>
          </ng-container>
        </ul>
      </section>
    </main>
  `,
})
export class AppComponent implements OnInit {
  networks$ = this.connectionService.networks$;
  network$ = this.connectionService.network$;
  wallets$ = this.walletService.wallets$;
  isConnected$ = this.walletService.connected$;
  balances$ = this.balanceService.balances$;
  totalInUSD$ = this.balanceService.totalInUSD$;

  constructor(
    @Inject(WALLET_SERVICE) private walletService: IWalletService,
    @Inject(CONNECTION_SERVICE) private connectionService: IConnectionService,
    @Inject(ACCOUNT_SERVICE) private accountService: IAccountService,
    @Inject(MARKET_SERVICE) private marketService: IMarketService,
    @Inject(BALANCE_SERVICE) private balanceService: IBalanceService
  ) {}

  ngOnInit() {
    this.connectionService.connection$
      .pipe(isNotNull)
      .subscribe((connection) => {
        this.accountService.loadConnection(connection);
        this.marketService.loadConnection(connection);
      });

    this.connectionService.connectionAccount$
      .pipe(isNotNull)
      .subscribe((account) => this.accountService.changeAccount(account));

    this.connectionService.networkTokens$.subscribe((networkTokens) =>
      this.balanceService.loadNetworkTokens(networkTokens)
    );

    this.connectionService.network$
      .pipe(isNotNull)
      .subscribe((network) => this.walletService.loadNetwork(network));

    this.walletService.publicKey$
      .pipe(isNotNull)
      .subscribe((publicKey) =>
        this.accountService.loadWalletPublicKey(publicKey)
      );

    this.walletService.connected$.subscribe((connected) => {
      this.accountService.loadWalletConnected(connected);
      this.balanceService.loadWalletConnected(connected);
    });

    this.accountService.tokenAccounts$.subscribe((tokenAccounts) => {
      this.marketService.loadTokenAccounts(tokenAccounts);
      this.balanceService.loadTokenAccounts(tokenAccounts);
    });

    this.marketService.mintTokens$.subscribe((mintTokens) =>
      this.balanceService.loadMintTokens(mintTokens)
    );

    this.marketService.mintAccounts$.subscribe((mintAccounts) =>
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

  onSelectNetwork(networkId: string) {
    this.connectionService.selectNetwork(networkId);
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
