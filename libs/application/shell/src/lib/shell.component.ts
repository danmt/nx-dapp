import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { NotificationsService } from '@nx-dapp/application/utils/notifications';
import { SolanaDappTransactionService } from '@nx-dapp/solana-dapp/angular';

@Component({
  selector: 'nx-dapp-shell-transactions-in-process',
  template: `
    <header>
      <h1>Transactions in Process ({{ inProcess$ | async }})</h1>
    </header>

    <ul>
      <li *ngFor="let transaction of transactions$ | async">
        {{ transaction.id }} - {{ transaction.status }}
      </li>
    </ul>

    <button
      (click)="close($event)"
      mat-raised-button
      color="primary"
      class="block mx-auto"
    >
      Close
    </button>
  `,
})
export class TransactionsInProcessComponent {
  transactions$ = this.transactionService.transactions$;
  inProcess$ = this.transactionService.inProcess$;

  constructor(
    private transactionService: SolanaDappTransactionService,
    private bottomSheetRef: MatBottomSheetRef<TransactionsInProcessComponent>
  ) {}

  close(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}

@Component({
  selector: 'nx-dapp-shell',
  template: `
    <nx-dapp-navigation>
      <router-outlet></router-outlet>

      <div class="fixed bottom-0 left-0 w-screen" *ngIf="isProcessing$ | async">
        <button
          class="mx-auto block"
          mat-raised-button
          color="primary"
          (click)="openTransactionsSheet()"
        >
          Transactions in Process ({{ inProcess$ | async }})
        </button>
      </div>
    </nx-dapp-navigation>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent implements OnInit {
  isProcessing$ = this.transactionService.isProcessing$;
  inProcess$ = this.transactionService.inProcess$;

  constructor(
    private notificationsService: NotificationsService,
    private transactionService: SolanaDappTransactionService,
    private bottomSheet: MatBottomSheet
  ) {}

  openTransactionsSheet() {
    this.bottomSheet.open(TransactionsInProcessComponent, {
      hasBackdrop: true,
    });
  }

  ngOnInit() {
    this.notificationsService.init();
  }
}
