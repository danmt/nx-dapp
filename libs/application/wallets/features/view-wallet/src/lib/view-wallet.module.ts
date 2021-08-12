import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModalHeaderModule } from '@nx-dapp/application/shared/ui/modal-header';
import { ViewWalletService } from './view-wallet.service';

import { ViewWalletComponent } from './view-wallet.component';

@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ModalHeaderModule,
  ],
  declarations: [ViewWalletComponent],
  exports: [ViewWalletComponent],
  providers: [ViewWalletService],
})
export class ViewWalletModule {}
