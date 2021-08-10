import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FocusModule } from '@nx-dapp/shared/ui/focus';
import { ModalHeaderModule } from '@nx-dapp/shared/ui/modal-header';

import { ConnectWalletComponent } from './connect-wallet.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ModalHeaderModule,
    FocusModule,
  ],
  declarations: [ConnectWalletComponent],
  exports: [ConnectWalletComponent],
})
export class ConnectWalletModule {}
