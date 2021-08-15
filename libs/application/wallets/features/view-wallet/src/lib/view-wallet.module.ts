import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CopyableTextModule } from '@nx-dapp/application/shared/ui/copyable-text';
import { ModalHeaderModule } from '@nx-dapp/application/shared/ui/modal-header';

import { ViewWalletComponent } from './view-wallet.component';
import { ViewWalletService } from './view-wallet.service';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ModalHeaderModule,
    CopyableTextModule,
  ],
  declarations: [ViewWalletComponent],
  providers: [ViewWalletService],
})
export class ViewWalletModule {}
