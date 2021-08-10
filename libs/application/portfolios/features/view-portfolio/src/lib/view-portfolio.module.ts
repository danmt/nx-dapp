import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';
import { PortfolioTotalsModule } from '@nx-dapp/application/portfolios/ui/portfolio-totals';
import { PositionListItemModule } from '@nx-dapp/application/portfolios/ui/position-list-item';
import { PageHeaderModule } from '@nx-dapp/shared/ui/page-header';

import { ViewPortfolioComponent } from './view-portfolio.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewPortfolioComponent },
    ]),
    MatButtonModule,
    MatDialogModule,
    MatGridListModule,
    PageHeaderModule,
    PositionListItemModule,
    PortfolioTotalsModule,
  ],
  declarations: [ViewPortfolioComponent],
})
export class ViewPortfolioModule {}
