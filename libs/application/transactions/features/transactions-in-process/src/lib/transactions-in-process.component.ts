import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TransactionsStore } from '@nx-dapp/application/transactions/data-access/transactions';

@Component({
  selector: 'nx-dapp-transactions-in-process',
  template: `
    <header nxDappModalHeader class="mr-8">
      <h1>Transactions in Process ({{ inProcess$ | async }})</h1>
      <p>All the transactions have been made during this session.</p>
    </header>

    <ul class="mt-2">
      <li *ngFor="let transaction of transactions$ | async">
        <nx-dapp-transaction-item
          [transaction]="transaction"
        ></nx-dapp-transaction-item>
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
  transactions$ = this.transactionsStore.transactions$;
  inProcess$ = this.transactionsStore.inProcess$;

  constructor(
    private transactionsStore: TransactionsStore,
    private bottomSheetRef: MatBottomSheetRef<TransactionsInProcessComponent>
  ) {}

  close(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
