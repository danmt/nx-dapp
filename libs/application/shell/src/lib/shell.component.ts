import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ChangeNetworkService } from '@nx-dapp/application/networks/features/change-network';
import { TransactionNotificationsService } from '@nx-dapp/application/transactions/utils/transaction-notifications';
import { ConnectWalletService } from '@nx-dapp/application/wallets/features/connect-wallet';
import { ViewWalletService } from '@nx-dapp/application/wallets/features/view-wallet';
import { WalletNotificationsService } from '@nx-dapp/application/wallets/utils/wallet-notifications';
import { isNotNull } from '@nx-dapp/shared/utils/operators';
import {
  SolanaDappTransactionService,
  SolanaDappWalletService,
} from '@nx-dapp/solana-dapp/angular';

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
})
export class ShellComponent implements OnInit {
  isProcessing$ = this.transactionService.isProcessing$;
  inProcess$ = this.transactionService.inProcess$;
  connected$ = this.walletService.connected$;
  walletAddress$ = this.walletService.walletAddress$.pipe(isNotNull);

  constructor(
    private walletNotificationsService: WalletNotificationsService,
    private transactionNotificationsService: TransactionNotificationsService,
    private transactionService: SolanaDappTransactionService,
    private walletService: SolanaDappWalletService,
    private connectWalletService: ConnectWalletService,
    private changeNetworkService: ChangeNetworkService,
    private viewWalletService: ViewWalletService
  ) {}

  ngOnInit() {
    this.walletNotificationsService.init();
    this.transactionNotificationsService.init();
  }

  onConnectWallet() {
    this.connectWalletService.open();
  }

  onDisconnectWallet() {
    this.walletService.disconnect();
  }

  onViewWallet() {
    this.viewWalletService.open();
  }

  onChangeNetwork() {
    this.changeNetworkService.open();
  }
}
