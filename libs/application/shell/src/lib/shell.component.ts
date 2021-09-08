import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import {
  ConnectionStore,
  WalletStore,
  WALLET_CONFIG,
} from '@danmt/wallet-adapter-angular';
import { PricesStore } from '@nx-dapp/application/market/data-access/prices';
import { NetworksStore } from '@nx-dapp/application/networks/data-access/networks';
import { ChangeNetworkComponent } from '@nx-dapp/application/networks/features/change-network';
import { TransactionsStore } from '@nx-dapp/application/transactions/data-access/transactions';
import { TransactionNotificationsService } from '@nx-dapp/application/transactions/features/notifications';
import { TransactionsInProcessComponent } from '@nx-dapp/application/transactions/features/transactions-in-process';
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
    <div class="block fixed bottom-0 left-0 w-screen z-10">
      <button
        *ngIf="processing$ | async"
        class="mx-auto block"
        mat-raised-button
        color="primary"
        (click)="onViewTransactions()"
      >
        <span class="flex justify-center gap-2 items-center">
          Transactions in Process ({{ inProcess$ | async }})
          <mat-spinner color="accent" diameter="24"></mat-spinner>
        </span>
      </button>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: WALLET_CONFIG,
      useValue: {
        wallets: [
          getSolletWallet(),
          getPhantomWallet(),
          getSolflareWallet(),
          getSolongWallet(),
          getBitpieWallet(),
          getBloctoWallet(),
        ],
        autoConnect: true,
      },
    },
    WalletStore,
    ConnectionStore,
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
    private walletNotificationsService: WalletNotificationsService,
    private transactionNotificationsService: TransactionNotificationsService,
    private matDialog: MatDialog,
    private matBottomSheet: MatBottomSheet
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
    this.matBottomSheet.open(TransactionsInProcessComponent, {
      hasBackdrop: true,
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
    });
  }

  onChangeNetwork() {
    this.matDialog.open(ChangeNetworkComponent, {
      hasBackdrop: true,
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
    });
  }
}
