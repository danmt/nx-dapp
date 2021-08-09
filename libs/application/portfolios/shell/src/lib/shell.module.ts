import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PortfoliosShellComponent } from './shell.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: PortfoliosShellComponent,
        children: [
          {
            path: 'view-portfolio',
            loadChildren: () =>
              import(
                '@nx-dapp/application/portfolios/features/view-portfolio'
              ).then((m) => m.ViewPortfolioModule),
          },
          {
            path: '**',
            redirectTo: 'view-portfolio',
          },
        ],
      },
    ]),
  ],
  declarations: [PortfoliosShellComponent],
})
export class PortfoliosShellModule {}
