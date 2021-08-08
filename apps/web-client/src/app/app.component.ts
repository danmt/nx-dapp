import { Component } from '@angular/core';
import {
  Network,
  SolanaDappBalanceService,
  SolanaDappMarketService,
  SolanaDappNetworkService,
  SolanaDappWalletService,
  WalletName,
} from '@nx-dapp/solana-dapp/angular';
import { combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

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
      <nx-dapp-connections-dropdown
        [networks]="networks"
        [defaultNetwork]="defaultNetwork"
        (selectNetwork)="onSelectNetwork($event)"
      ></nx-dapp-connections-dropdown>
    </header>

    <main>
      <h1>First Dapp</h1>

      <section>
        <h2>Total in USD: {{ totalInUSD$ | async | currency }}</h2>

        <ul>
          <ng-container *ngFor="let balance of balances$ | async">
            <li class="flex p-2 mb-1 items-center">
              <figure class="block w-6 h-6 mr-2">
                <img class="w-full h-full" [src]="balance.logo" />
              </figure>
              <div>
                {{ balance.name }} ({{ balance.symbol }}):
                {{ balance.quantity | currency: 'USD':'':'1.2-12' }} ({{
                  balance.total | currency: 'USD':'$':'1.2-12'
                }}
                @ {{ balance.price | currency: 'USD':'$':'1.2-12' }})
              </div>
            </li>
          </ng-container>
        </ul>
      </section>
    </main>
  `,
})
export class AppComponent {
  wallets$ = this.walletService.wallets$;
  networks = this.networkService.networks;
  network$ = this.networkService.network$;
  defaultNetwork = this.networkService.defaultNetwork;
  isConnected$ = this.walletService.connected$;
  balances$ = combineLatest([
    this.marketService.getPricesFromWallet(),
    this.balanceService.getBalancesFromWallet(),
    this.networkService.tokens$,
  ]).pipe(
    map(([prices, balances, tokens]) =>
      balances.map((balance) => {
        const token =
          tokens.find((token) => token.address === balance.address) || null;

        const price =
          prices.find((price) => price.address === balance.address)?.price || 0;

        return {
          ...balance,
          price,
          total: price * balance.quantity,
          logo: token?.logoURI,
          name: token?.name,
          symbol: token?.symbol,
        };
      })
    ),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  totalInUSD$ = this.balances$.pipe(
    map((balances) =>
      balances.reduce((totalInUSD, balance) => totalInUSD + balance.total, 0)
    )
  );

  constructor(
    private walletService: SolanaDappWalletService,
    private networkService: SolanaDappNetworkService,
    private marketService: SolanaDappMarketService,
    private balanceService: SolanaDappBalanceService
  ) {}

  onSelectNetwork(network: Network) {
    this.networkService.changeNetwork(network);
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
