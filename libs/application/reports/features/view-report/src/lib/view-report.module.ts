import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageHeaderModule } from '@nx-dapp/shared/ui/page-header';

import { ViewReportComponent } from './view-report.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewReportComponent },
    ]),
    PageHeaderModule,
  ],
  declarations: [ViewReportComponent],
})
export class ViewReportModule {}
