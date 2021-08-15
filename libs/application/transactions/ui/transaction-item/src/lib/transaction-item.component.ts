import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
import { Transaction } from '@nx-dapp/solana-dapp/utils/types';

@Component({
  selector: 'nx-dapp-transaction-item',
  template: `
    <ng-container *ngIf="transaction">
      <div class="flex gap-4">
        <figure class="w-16 h-16 bg-black bg-opacity-25">
          <img [src]="transaction.logo" />
        </figure>

        <div>
          <p class="m-0">
            <span class="text-lg">
              {{ transaction.amount | number: '1.2-12' }}
            </span>
            {{ transaction.symbol }}
          </p>
          <a
            *ngIf="transaction.txId"
            [href]="'https://solscan.io/tx/' + transaction.txId"
            target="_blank"
            class="inline-block text-xs underline"
          >
            View in Solscan <mat-icon class="scale-75">open_in_new</mat-icon>
          </a>
        </div>

        <mat-spinner
          *ngIf="transaction.isProcessing"
          diameter="24"
          color="primary"
        ></mat-spinner>
      </div>

      <div>
        <p class="m-0 text-right">
          {{ transaction.date | date: 'shortDate' }}
        </p>
        <p class="m-0 text-right">
          {{ transaction.date | date: 'shortTime' }}
        </p>
        <div
          class="px-2 py-1 text-xs uppercase font-bold rounded-sm"
          [ngClass]="{
            'bg-success text-white': transaction.status === 'Confirmed',
            'bg-error text-white': transaction.status === 'Cancelled',
            'bg-warning text-black':
              transaction.status !== 'Confirmed' &&
              transaction.status !== 'Cancelled'
          }"
        >
          {{ transaction.status }}
        </div>
      </div>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionItemComponent {
  @HostBinding('class') class = 'flex justify-between items-center mb-4';
  @Input() transaction: Transaction | null = null;
}
