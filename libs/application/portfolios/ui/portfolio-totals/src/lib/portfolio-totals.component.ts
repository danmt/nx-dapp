import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Portfolio } from '@nx-dapp/application/portfolios/utils';

@Component({
  selector: 'nx-dapp-portfolio-totals',
  template: `
    <mat-card class="flex flex-wrap gap-8">
      <div>
        <h2>Total</h2>
        <p class="text-3xl">{{ portfolio.totalInUSD | currency }}</p>
      </div>
      <div>
        <h2>Total in stable</h2>
        <p class="text-3xl">
          {{ portfolio.stableCoinsTotalInUSD | currency }}
        </p>
      </div>
      <div>
        <h2>Total in non-stable</h2>
        <p class="text-3xl">
          {{ portfolio.nonStableCoinsTotalInUSD | currency }}
        </p>
      </div>
    </mat-card>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioTotalsComponent {
  @Input() portfolio!: Portfolio;
}
