import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { ModalHeaderModule } from '@nx-dapp/shared/ui/modal-header';

import { ChangeNetworkComponent } from './change-network.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatRadioModule,
    ModalHeaderModule,
  ],
  declarations: [ChangeNetworkComponent],
  exports: [ChangeNetworkComponent],
})
export class ChangeNetworkModule {}
