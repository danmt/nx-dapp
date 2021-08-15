import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { DarkThemeModule } from '@nx-dapp/application/shared/ui/dark-theme';
import { ObscureAddressModule } from '@nx-dapp/application/shared/utils/obscure-address';

import { NavigationComponent } from './navigation.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    LayoutModule,
    DarkThemeModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatSlideToggleModule,
    ObscureAddressModule,
  ],
  declarations: [NavigationComponent],
  exports: [NavigationComponent],
})
export class NavigationModule {}
