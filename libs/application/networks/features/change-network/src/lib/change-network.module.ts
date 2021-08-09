import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveComponentModule } from '@ngrx/component';
import { NetworksRadioGroupModule } from '@nx-dapp/application/networks/ui/networks-radio-group';
import { ModalHeaderModule } from '@nx-dapp/shared/ui/modal-header';

import { ChangeNetworkComponent } from './change-network.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    ReactiveComponentModule,
    ModalHeaderModule,
    NetworksRadioGroupModule,
  ],
  declarations: [ChangeNetworkComponent],
  exports: [ChangeNetworkComponent],
})
export class ChangeNetworkModule {}
