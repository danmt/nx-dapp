import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ModalHeaderModule } from '@nx-dapp/application/shared/ui/modal-header';

import { SplTransferComponent } from './spl-transfer.component';
import { SplTransferService } from './spl-transfer.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ModalHeaderModule,
  ],
  declarations: [SplTransferComponent],
  exports: [SplTransferComponent],
  providers: [SplTransferService],
})
export class SplTransferModule {}
