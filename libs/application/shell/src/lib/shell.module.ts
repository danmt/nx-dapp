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
import { ChangeNetworkModule } from '@nx-dapp/application/networks/features/change-network';
import { SettingsMenuModule } from '@nx-dapp/application/shared/ui/settings-menu';
import { TransactionsInProcessModule } from '@nx-dapp/application/transactions/features/transactions-in-process';
import { TransactionNotificationsModule } from '@nx-dapp/application/transactions/utils/transaction-notifications';
import { ConnectWalletModule } from '@nx-dapp/application/wallets/features/connect-wallet';
import { ViewWalletModule } from '@nx-dapp/application/wallets/features/view-wallet';
import { WalletNotificationsModule } from '@nx-dapp/application/wallets/utils/wallet-notifications';

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
    WalletNotificationsModule,
    TransactionNotificationsModule,
    ConnectWalletModule,
    ChangeNetworkModule,
    ViewWalletModule,
    TransactionsInProcessModule,
    SettingsMenuModule,
  ],
  declarations: [ShellComponent, NavigationComponent],
})
export class ShellModule {}
