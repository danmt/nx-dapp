import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { ConnectDropdownComponent } from './connect-dropdown.component';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatMenuModule],
  declarations: [ConnectDropdownComponent],
  exports: [ConnectDropdownComponent],
})
export class WalletModule {}
