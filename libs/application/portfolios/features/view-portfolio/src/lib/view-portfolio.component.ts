import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';

import { ViewPortfolioStore } from './view-portfolio.store';

@Component({
  selector: 'nx-dapp-view-portfolio',
  template: `
    <header nxDappPageHeader>
      <h1>Portfolio</h1>
      <p>Monitor all your positions.</p>
    </header>
    <main>
      <ng-container *ngIf="portfolio$ | async as portfolio">
        <div
          *ngIf="portfolio.positions.length > 0; else emptyPortfolio"
          class="flex flex-col gap-4"
        >
          <section>
            <nx-dapp-portfolio-totals
              [portfolio]="portfolio"
            ></nx-dapp-portfolio-totals>
          </section>

          <section>
            <mat-grid-list cols="5" rowHeight="280px" gutterSize="16px">
              <mat-grid-tile
                *ngFor="let position of portfolio.positions"
                colspan="1"
                rowspan="1"
              >
                <nx-dapp-position-list-item
                  [position]="position"
                ></nx-dapp-position-list-item>
              </mat-grid-tile>
            </mat-grid-list>
          </section>
        </div>
      </ng-container>

      <ng-template #emptyPortfolio>
        <section class="m-4">
          <p class="text-center text-xl">
            You have no positions in your portfolio.
          </p>
        </section>
      </ng-template>
    </main>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ViewPortfolioStore],
})
export class ViewPortfolioComponent implements OnInit {
  @HostBinding('class') class = 'block p-4';
  portfolio$ = this.viewPortfolioStore.portfolio$;

  constructor(private viewPortfolioStore: ViewPortfolioStore) {}

  ngOnInit() {
    this.viewPortfolioStore.init();
  }
}
