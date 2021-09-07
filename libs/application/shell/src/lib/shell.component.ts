import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import {
  connectionProvider,
  ConnectionStore,
  walletProvider,
  WalletStore,
} from '@danmt/wallet-adapter-angular';
import { PricesStore } from '@nx-dapp/application/market/data-access/prices';
import { NetworksStore } from '@nx-dapp/application/networks/data-access/networks';
import { ChangeNetworkService } from '@nx-dapp/application/networks/features/change-network';
import { TransactionsStore } from '@nx-dapp/application/transactions/data-access/transactions';
import { TransactionsInProcessService } from '@nx-dapp/application/transactions/features/transactions-in-process';
import { BalancesStore } from '@nx-dapp/application/wallets/data-access/balances';
import { ConnectWalletComponent } from '@nx-dapp/application/wallets/features/connect-wallet';
import { WalletNotificationsService } from '@nx-dapp/application/wallets/features/notifications';
import { ViewWalletComponent } from '@nx-dapp/application/wallets/features/view-wallet';
import { isNotNull } from '@nx-dapp/shared/utils/operators';
import {
  getBitpieWallet,
  getBloctoWallet,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
} from '@solana/wallet-adapter-wallets';
import { map } from 'rxjs/operators';
import { TransactionNotificationsService } from '@nx-dapp/application/transactions/features/notifications';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'nx-dapp-shell',
  template: `
    <nx-dapp-navigation
      *ngrxLet="connected$ as isConnected"
      [isConnected]="isConnected"
      [walletAddress]="walletAddress$ | async"
      (connectWallet)="onConnectWallet()"
      (disconnectWallet)="onDisconnectWallet()"
    >
      <nx-dapp-settings-menu
        [isConnected]="isConnected"
        (viewWallet)="onViewWallet()"
        (viewTransactions)="onViewTransactions()"
        (changeNetwork)="onChangeNetwork()"
        (disconnectWallet)="onDisconnectWallet()"
      >
      </nx-dapp-settings-menu>
    </nx-dapp-navigation>
    <nx-dapp-transactions-in-process-trigger
      *ngIf="processing$ | async"
      [inProcess]="inProcess$ | async"
      (openSheet)="onViewTransactions()"
    ></nx-dapp-transactions-in-process-trigger>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ...walletProvider({
      wallets: [
        getSolletWallet(),
        getPhantomWallet(),
        getSolflareWallet(),
        getSolongWallet(),
        getBitpieWallet(),
        getBloctoWallet(),
      ],
      // autoConnect: true,
    }),
    ...connectionProvider(),
    BalancesStore,
    PricesStore,
    NetworksStore,
    TransactionsStore,
    WalletNotificationsService,
    TransactionNotificationsService,
  ],
})
export class ShellComponent implements OnInit {
  processing$ = this.transactionsStore.processing$;
  inProcess$ = this.transactionsStore.inProcess$;
  connected$ = this.walletStore.connected$;
  walletAddress$ = this.walletStore.publicKey$.pipe(
    isNotNull,
    map((publicKey) => publicKey.toBase58())
  );

  constructor(
    private viewContainerRef: ViewContainerRef,
    private walletStore: WalletStore,
    private connectionStore: ConnectionStore,
    private transactionsStore: TransactionsStore,
    private networksStore: NetworksStore,
    private changeNetworkService: ChangeNetworkService,
    private transactionsInProcessService: TransactionsInProcessService,
    private walletNotificationsService: WalletNotificationsService,
    private transactionNotificationsService: TransactionNotificationsService,
    private matDialog: MatDialog
  ) {}

  ngOnInit() {
    this.walletNotificationsService.init();
    this.transactionNotificationsService.init();

    this.connectionStore.setEndpoint(
      this.networksStore.selectedNetwork$.pipe(
        isNotNull,
        map(({ url }) => url)
      )
    );
  }

  onConnectWallet() {
    this.matDialog.open(ConnectWalletComponent, {
      hasBackdrop: true,
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
    });
  }

  onDisconnectWallet() {
    this.walletStore.disconnect();
  }

  onViewWallet() {
    this.matDialog.open(ViewWalletComponent, {
      hasBackdrop: true,
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
    });
  }

  onViewTransactions() {
    this.transactionsInProcessService.open(this.viewContainerRef);
  }

  onChangeNetwork() {
    this.changeNetworkService.open(this.viewContainerRef);
  }
}
