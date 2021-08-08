import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FeaturesShellComponent } from './shell.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: FeaturesShellComponent,
        children: [
          {
            path: 'view-report',
            loadChildren: () =>
              import('@nx-dapp/application/reports/features/view-report').then(
                (m) => m.ViewReportModule
              ),
          },
          {
            path: '**',
            redirectTo: 'view-report',
          },
        ],
      },
    ]),
  ],
  declarations: [FeaturesShellComponent],
})
export class FeaturesShellModule {}
