import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { PortfolioTotalsComponent } from './portfolio-totals.component';

@NgModule({
  imports: [CommonModule, MatCardModule],
  declarations: [PortfolioTotalsComponent, PortfolioTotalsComponent],
  exports: [PortfolioTotalsComponent, PortfolioTotalsComponent],
})
export class PortfolioTotalsModule {}
