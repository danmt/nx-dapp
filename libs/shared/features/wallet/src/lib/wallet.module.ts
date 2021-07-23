import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { ConnectDropdownComponent } from './connect-dropdown.component';
import { ConnectProviderComponent } from './connect-provider.component';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatMenuModule],
  declarations: [ConnectDropdownComponent, ConnectProviderComponent],
  exports: [ConnectDropdownComponent],
})
export class WalletModule {}
