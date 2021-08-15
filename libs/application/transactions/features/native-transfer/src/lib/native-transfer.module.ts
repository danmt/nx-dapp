import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ModalHeaderModule } from '@nx-dapp/application/shared/ui/modal-header';

import { NativeTransferComponent } from './native-transfer.component';
import { NativeTransferService } from './native-transfer.service';

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
  declarations: [NativeTransferComponent],
  exports: [NativeTransferComponent],
  providers: [NativeTransferService],
})
export class NativeTransferModule {}
