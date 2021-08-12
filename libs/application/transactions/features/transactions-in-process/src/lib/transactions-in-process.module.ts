import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TransactionsInProcessService } from './transactions-in-process.service';
import { TransactionsInProcessTriggerComponent } from './transactions-in-process-trigger.component';
import { TransactionsInProcessComponent } from './transactions-in-process.component';
import { MatButtonModule } from '@angular/material/button';

import { ModalHeaderModule } from '@nx-dapp/application/shared/ui/modal-header';

@NgModule({
  imports: [
    CommonModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ModalHeaderModule,
  ],
  declarations: [
    TransactionsInProcessComponent,
    TransactionsInProcessTriggerComponent,
  ],
  exports: [TransactionsInProcessTriggerComponent],
  providers: [TransactionsInProcessService],
})
export class TransactionsInProcessModule {}
