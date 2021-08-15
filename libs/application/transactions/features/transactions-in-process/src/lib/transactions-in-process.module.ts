import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModalHeaderModule } from '@nx-dapp/application/shared/ui/modal-header';
import { TransactionItemModule } from '@nx-dapp/application/transactions/ui/transaction-item';

import { TransactionsInProcessTriggerComponent } from './transactions-in-process-trigger.component';
import { TransactionsInProcessComponent } from './transactions-in-process.component';
import { TransactionsInProcessService } from './transactions-in-process.service';

@NgModule({
  imports: [
    CommonModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ModalHeaderModule,
    TransactionItemModule,
  ],
  declarations: [
    TransactionsInProcessComponent,
    TransactionsInProcessTriggerComponent,
  ],
  exports: [TransactionsInProcessTriggerComponent],
  providers: [TransactionsInProcessService],
})
export class TransactionsInProcessModule {}
