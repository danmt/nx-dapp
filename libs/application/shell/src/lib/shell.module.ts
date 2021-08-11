import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { NotificationsModule } from '@nx-dapp/application/utils/notifications';
import { ConnectWalletModule } from '@nx-dapp/application/wallets/features/connect-wallet';

import { ReactiveComponentModule } from '@ngrx/component';
import { NavigationComponent } from './navigation.component';
import {
  ShellComponent,
  TransactionsInProcessComponent,
} from './shell.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ShellComponent,
        children: [
          {
            path: 'portfolios',
            loadChildren: () =>
              import('@nx-dapp/application/portfolios/shell').then(
                (m) => m.PortfoliosShellModule
              ),
          },
          {
            path: '**',
            redirectTo: 'portfolios',
          },
        ],
      },
    ]),
    LayoutModule,
    MatToolbarModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatDividerModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    ReactiveComponentModule,
    NotificationsModule,
    ConnectWalletModule,
  ],
  declarations: [
    ShellComponent,
    NavigationComponent,
    TransactionsInProcessComponent,
  ],
})
export class ShellModule {}
