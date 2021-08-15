import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TransactionItemComponent } from './transaction-item.component';

@NgModule({
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  declarations: [TransactionItemComponent],
  exports: [TransactionItemComponent],
})
export class TransactionItemModule {}
