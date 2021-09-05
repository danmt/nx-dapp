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
import { ChangeNetworkService } from '@nx-dapp/application/networks/features/change-network';
import { TransactionsInProcessService } from '@nx-dapp/application/transactions/features/transactions-in-process';
import { TransactionNotificationsService } from '@nx-dapp/application/transactions/utils/transaction-notifications';
import { BalancesStore } from '@nx-dapp/application/wallets/data-access/balances';
import { ConnectWalletService } from '@nx-dapp/application/wallets/features/connect-wallet';
import { ViewWalletService } from '@nx-dapp/application/wallets/features/view-wallet';
import { WalletNotificationsService } from '@nx-dapp/application/wallets/utils/wallet-notifications';
import { isNotNull } from '@nx-dapp/shared/utils/operators';
import {
  SolanaDappNetworkService,
  SolanaDappTransactionService,
} from '@nx-dapp/solana-dapp/angular';
import {
  getBitpieWallet,
  getBloctoWallet,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
} from '@solana/wallet-adapter-wallets';
import { map } from 'rxjs/operators';
import { PricesStore } from '@nx-dapp/application/market/data-access/prices';

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
      *ngIf="isProcessing$ | async"
      [inProcess]="inProcess$ | async"
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
      autoConnect: true,
    }),
    ...connectionProvider(),
    BalancesStore,
    PricesStore,
  ],
})
export class ShellComponent implements OnInit {
  isProcessing$ = this.transactionService.isProcessing$;
  inProcess$ = this.transactionService.inProcess$;
  connected$ = this.walletStore.connected$;
  walletAddress$ = this.walletStore.publicKey$.pipe(
    isNotNull,
    map((publicKey) => publicKey.toBase58())
  );

  constructor(
    private viewContainerRef: ViewContainerRef,
    private walletStore: WalletStore,
    private connectionStore: ConnectionStore,
    private walletNotificationsService: WalletNotificationsService,
    private transactionNotificationsService: TransactionNotificationsService,
    private transactionService: SolanaDappTransactionService,
    private networkService: SolanaDappNetworkService,
    private connectWalletService: ConnectWalletService,
    private changeNetworkService: ChangeNetworkService,
    private viewWalletService: ViewWalletService,
    private transactionsInProcessService: TransactionsInProcessService
  ) {}

  ngOnInit() {
    this.walletNotificationsService.init();
    this.transactionNotificationsService.init();

    this.connectionStore.setEndpoint(
      this.networkService.network$.pipe(map(({ url }) => url))
    );
  }

  onConnectWallet() {
    this.connectWalletService.open(this.viewContainerRef);
  }

  onDisconnectWallet() {
    this.walletStore.disconnect();
  }

  onViewWallet() {
    this.viewWalletService.open(this.viewContainerRef);
  }

  onViewTransactions() {
    this.transactionsInProcessService.open();
  }

  onChangeNetwork() {
    this.changeNetworkService.open();
  }
}
