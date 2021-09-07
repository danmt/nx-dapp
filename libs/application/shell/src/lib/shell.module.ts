import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { ChangeNetworkModule } from '@nx-dapp/application/networks/features/change-network';
import { CopyableTextModule } from '@nx-dapp/application/shared/ui/copyable-text';
import { FocusModule } from '@nx-dapp/application/shared/ui/focus';
import { NavigationModule } from '@nx-dapp/application/shared/ui/navigation';
import { SettingsMenuModule } from '@nx-dapp/application/shared/ui/settings-menu';
import { TransactionsInProcessModule } from '@nx-dapp/application/transactions/features/transactions-in-process';
import { ConnectWalletComponent } from '@nx-dapp/application/wallets/features/connect-wallet';
import { ViewWalletComponent } from '@nx-dapp/application/wallets/features/view-wallet';

import { ShellComponent } from './shell.component';
import { ModalHeaderModule } from '@nx-dapp/application/shared/ui/modal-header';

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
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ReactiveComponentModule,
    ChangeNetworkModule,
    TransactionsInProcessModule,
    SettingsMenuModule,
    NavigationModule,
    CopyableTextModule,
    FocusModule,
    ModalHeaderModule,
  ],
  declarations: [ShellComponent, ConnectWalletComponent, ViewWalletComponent],
})
export class ShellModule {}
