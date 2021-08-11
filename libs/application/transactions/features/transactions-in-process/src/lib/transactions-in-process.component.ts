import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { SolanaDappTransactionService } from '@nx-dapp/solana-dapp/angular';

@Component({
  selector: 'nx-dapp-transactions-in-process',
  template: `
    <header nxDappModalHeader class="mr-8">
      <h1>Transactions in Process ({{ inProcess$ | async }})</h1>
      <p>All the transactions have been made during this session.</p>
    </header>

    <ul class="mt-2">
      <li
        *ngFor="let transaction of transactions$ | async"
        class="flex justify-between items-center mb-4"
      >
        <p class="flex items-center m-0 gap-2">
          <span>{{ transaction.id }}</span>
          <mat-spinner
            *ngIf="transaction.status !== 'Confirmed'"
            diameter="24"
            color="primary"
          ></mat-spinner>
        </p>
        <div>{{ transaction.status }}</div>
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
