import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { PortfolioTotalsModule } from '@nx-dapp/application/portfolios/ui/portfolio-totals';
import { PositionListItemModule } from '@nx-dapp/application/portfolios/ui/position-list-item';
import { PageHeaderModule } from '@nx-dapp/application/shared/ui/page-header';
import { NativeTransferComponent } from '@nx-dapp/application/transactions/features/native-transfer';
import { SplTransferComponent } from '@nx-dapp/application/transactions/features/spl-transfer';

import { ViewPortfolioComponent } from './view-portfolio.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewPortfolioComponent },
    ]),
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatGridListModule,
    PageHeaderModule,
    PositionListItemModule,
    PortfolioTotalsModule,
  ],
  declarations: [
    ViewPortfolioComponent,
    NativeTransferComponent,
    SplTransferComponent,
  ],
})
export class ViewPortfolioModule {}
