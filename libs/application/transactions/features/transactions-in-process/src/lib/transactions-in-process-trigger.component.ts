import { Component, HostBinding, Input } from '@angular/core';

import { TransactionsInProcessService } from './transactions-in-process.service';

@Component({
  selector: 'nx-dapp-transactions-in-process-trigger',
  template: `
    <button
      class="mx-auto block"
      mat-raised-button
      color="primary"
      (click)="openTransactionsSheet()"
    >
      <span class="flex justify-center gap-2 items-center">
        Transactions in Process ({{ inProcess }})
        <mat-spinner color="accent" diameter="24"></mat-spinner>
      </span>
    </button>
  `,
})
export class TransactionsInProcessTriggerComponent {
  @HostBinding('class') class = 'block fixed bottom-0 left-0 w-screen z-10';
  @Input() inProcess: number | null = null;

  constructor(
    private transactionsInProcessService: TransactionsInProcessService
  ) {}

  openTransactionsSheet() {
    this.transactionsInProcessService.open();
  }
}
