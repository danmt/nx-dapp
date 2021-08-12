import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TransactionNotificationsService } from '@nx-dapp/application/transactions/utils/transaction-notifications';
import { WalletNotificationsService } from '@nx-dapp/application/wallets/utils/wallet-notifications';
import { SolanaDappTransactionService } from '@nx-dapp/solana-dapp/angular';

@Component({
  selector: 'nx-dapp-shell',
  template: `
    <nx-dapp-navigation>
      <router-outlet></router-outlet>

      <nx-dapp-transactions-in-process-trigger
        *ngIf="isProcessing$ | async"
        [inProcess]="inProcess$ | async"
      ></nx-dapp-transactions-in-process-trigger>
    </nx-dapp-navigation>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent implements OnInit {
  isProcessing$ = this.transactionService.isProcessing$;
  inProcess$ = this.transactionService.inProcess$;

  constructor(
    private walletNotificationsService: WalletNotificationsService,
    private transactionNotificationsService: TransactionNotificationsService,
    private transactionService: SolanaDappTransactionService
  ) {}

  ngOnInit() {
    this.walletNotificationsService.init();
    this.transactionNotificationsService.init();
  }
}
