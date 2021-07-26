import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { WalletsDropdownComponent } from './dropdown.component';
import { WalletOptionComponent } from './option.component';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatMenuModule],
  declarations: [WalletsDropdownComponent, WalletOptionComponent],
  exports: [WalletsDropdownComponent],
})
export class WalletModule {}
