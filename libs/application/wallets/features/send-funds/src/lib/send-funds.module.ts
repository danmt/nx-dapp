import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

import { SendFundsComponent } from './send-funds.component';

@NgModule({
  imports: [CommonModule, MatDialogModule],
  declarations: [SendFundsComponent],
  exports: [SendFundsComponent],
})
export class SendFundsModule {}
