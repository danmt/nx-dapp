import { CommonModule } from '@angular/common';
import { InjectionToken, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { ChangeNetworkModule } from '@nx-dapp/application/networks/features/change-network';
import { NavigationModule } from '@nx-dapp/application/shared/ui/navigation';
import { SettingsMenuModule } from '@nx-dapp/application/shared/ui/settings-menu';
import { TransactionsInProcessModule } from '@nx-dapp/application/transactions/features/transactions-in-process';
import { TransactionNotificationsModule } from '@nx-dapp/application/transactions/utils/transaction-notifications';
import { ConnectWalletModule } from '@nx-dapp/application/wallets/features/connect-wallet';
import { ViewWalletModule } from '@nx-dapp/application/wallets/features/view-wallet';

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
    ReactiveComponentModule,
    TransactionNotificationsModule,
    ConnectWalletModule,
    ChangeNetworkModule,
    ViewWalletModule,
    TransactionsInProcessModule,
    SettingsMenuModule,
    NavigationModule,
  ],
  declarations: [ShellComponent],
  providers: [
    {
      provide: new InjectionToken('document'),
      useValue: document,
    },
  ],
})
export class ShellModule {}
