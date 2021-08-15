import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';
import { PortfolioTotalsModule } from '@nx-dapp/application/portfolios/ui/portfolio-totals';
import { PositionListItemModule } from '@nx-dapp/application/portfolios/ui/position-list-item';
import { PageHeaderModule } from '@nx-dapp/application/shared/ui/page-header';
import { ConnectWalletModule } from '@nx-dapp/application/wallets/features/connect-wallet';
import { NativeTransferModule } from '@nx-dapp/application/wallets/features/native-transfer';
import { SplTransferModule } from '@nx-dapp/application/wallets/features/spl-transfer';

import { ViewPortfolioComponent } from './view-portfolio.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewPortfolioComponent },
    ]),
    MatButtonModule,
    MatGridListModule,
    PageHeaderModule,
    PositionListItemModule,
    PortfolioTotalsModule,
    SplTransferModule,
    NativeTransferModule,
    ConnectWalletModule,
  ],
  declarations: [ViewPortfolioComponent],
})
export class ViewPortfolioModule {}
