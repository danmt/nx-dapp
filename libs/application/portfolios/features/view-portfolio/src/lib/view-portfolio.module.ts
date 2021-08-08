import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageHeaderModule } from '@nx-dapp/shared/ui/page-header';

import { ViewPortfolioComponent } from './view-portfolio.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewPortfolioComponent },
    ]),
    PageHeaderModule,
  ],
  declarations: [ViewPortfolioComponent],
})
export class ViewPortfolioModule {}
