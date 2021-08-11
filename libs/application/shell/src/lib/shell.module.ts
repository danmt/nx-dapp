import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { TransactionsInProcessModule } from '@nx-dapp/application/transactions/features/transactions-in-process';
import { NotificationsModule } from '@nx-dapp/application/utils/notifications';
import { ConnectWalletModule } from '@nx-dapp/application/wallets/features/connect-wallet';

import { NavigationComponent } from './navigation.component';
import { ShellComponent } from './shell.component';

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
    MatButtonModule,
    MatDividerModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    ReactiveComponentModule,
    NotificationsModule,
    ConnectWalletModule,
    TransactionsInProcessModule,
  ],
  declarations: [ShellComponent, NavigationComponent],
})
export class ShellModule {}
