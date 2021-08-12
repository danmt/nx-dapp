import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveComponentModule } from '@ngrx/component';
import { NetworksRadioGroupModule } from '@nx-dapp/application/networks/ui/networks-radio-group';
import { ModalHeaderModule } from '@nx-dapp/shared/ui/modal-header';

import { ChangeNetworkComponent } from './change-network.component';
import { ChangeNetworkService } from './change-network.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    ReactiveComponentModule,
    ModalHeaderModule,
    NetworksRadioGroupModule,
  ],
  declarations: [ChangeNetworkComponent],
  exports: [ChangeNetworkComponent],
  providers: [ChangeNetworkService],
})
export class ChangeNetworkModule {}
