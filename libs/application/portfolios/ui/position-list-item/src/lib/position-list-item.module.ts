import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ObscureAddressModule } from '@nx-dapp/application/shared/utils/obscure-address';

import { PositionListItemComponent } from './position-list-item.component';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatCardModule, ObscureAddressModule],
  declarations: [PositionListItemComponent],
  exports: [PositionListItemComponent],
})
export class PositionListItemModule {}
