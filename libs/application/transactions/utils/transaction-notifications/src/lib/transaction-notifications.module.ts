import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { TransactionNotificationsService } from './transaction-notifications.service';
import { TransactionCreatedComponent } from './transaction-created.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  providers: [TransactionNotificationsService],
  declarations: [TransactionCreatedComponent],
})
export class TransactionNotificationsModule {}
