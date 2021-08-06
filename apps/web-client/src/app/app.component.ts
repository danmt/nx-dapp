import { Component, Inject, OnInit } from '@angular/core';
import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import {
  CONNECTION_SERVICE,
  IConnectionService,
  IWalletService,
  WALLET_SERVICE,
  WalletName,
} from '@nx-dapp/solana-dapp/angular';
import { getPrices } from '@nx-dapp/solana-dapp/market/utils/get-prices';
import { getTokens } from '@nx-dapp/solana-dapp/market/utils/get-tokens';
import { getBalances } from '@nx-dapp/solana-dapp/wallet/utils/get-balances';
import { combineLatest, of } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';

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
            <li class="flex p-2 mb-1 items-center">
              <figure class="block w-6 h-6 mr-2">
                <img class="w-full h-full" [src]="balance.logo" />
              </figure>
              <div>
                {{ balance.name }} ({{ balance.symbol }}):
                {{ balance.quantity }} ({{
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
export class AppComponent implements OnInit {
  networks$ = this.connectionService.networks$;
  network$ = this.connectionService.network$;
  wallets$ = this.walletService.wallets$;
  isConnected$ = this.walletService.connected$;

  balances$ = combineLatest([
    this.walletService.publicKey$.pipe(
      map((publicKey) => publicKey?.toBase58() || null),
      distinctUntilChanged()
    ),
    this.connectionService.network$.pipe(
      map((network) => network?.url || null),
      distinctUntilChanged()
    ),
    this.connectionService.network$.pipe(
      map((network) => network?.chainID || null),
      distinctUntilChanged()
    ),
  ]).pipe(
    switchMap(([walletPublicKey, rpcEndpoint, chainID]) => {
      if (!walletPublicKey || !rpcEndpoint || !chainID) {
        return of([]);
      }

      return combineLatest([
        getPrices({
          rpcEndpoint,
          walletPublicKey,
          marketRpcEndpoint: 'https://solana-api.projectserum.com/',
        }),
        getBalances({
          rpcEndpoint,
          walletPublicKey,
        }),
        getTokens(chainID),
      ]).pipe(
        map(([prices, balances, tokens]) =>
          balances.map((balance) => {
            const token =
              tokens.find((token) => token.address === balance.address) || null;

            const price =
              prices.find((price) => price.address === balance.address)
                ?.price || 0;

            return {
              ...balance,
              price,
              total: price * balance.quantity,
              logo: token?.logoURI,
              name: token?.name,
              symbol: token?.symbol,
            };
          })
        )
      );
    }),
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
    @Inject(WALLET_SERVICE) private walletService: IWalletService,
    @Inject(CONNECTION_SERVICE) private connectionService: IConnectionService
  ) {}

  ngOnInit() {
    this.connectionService.network$
      .pipe(isNotNull)
      .subscribe((network) => this.walletService.loadNetwork(network));
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
