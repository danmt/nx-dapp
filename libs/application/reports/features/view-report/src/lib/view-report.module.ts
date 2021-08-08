import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ViewReportComponent } from './view-report.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewReportComponent },
    ]),
  ],
  declarations: [ViewReportComponent],
})
export class ViewReportModule {}
