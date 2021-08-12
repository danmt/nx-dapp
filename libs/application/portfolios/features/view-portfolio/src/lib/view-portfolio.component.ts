import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { Position } from '@nx-dapp/application/portfolios/utils';
import { ConnectWalletService } from '@nx-dapp/application/wallets/features/connect-wallet';
import { SendFundsService } from '@nx-dapp/application/wallets/features/send-funds';
import { SolanaDappWalletService } from '@nx-dapp/solana-dapp/angular';

import { ViewPortfolioStore } from './view-portfolio.store';

@Component({
  selector: 'nx-dapp-view-portfolio',
  template: `
    <header nxDappPageHeader>
      <h1>Portfolio</h1>
      <p>Monitor all your positions.</p>
    </header>

    <main>
      <ng-container *ngIf="connected$ | async; else notConnected">
        <ng-container
          *ngIf="portfolio$ | async as portfolio; portfolioNotFound"
        >
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
                    (sendFunds)="onSendFunds(position)"
                  ></nx-dapp-position-list-item>
                </mat-grid-tile>
              </mat-grid-list>
            </section>
          </div>
        </ng-container>
      </ng-container>

      <ng-template #emptyPortfolio>
        <section class="m-4">
          <p class="text-center text-xl">
            You have no positions in your portfolio.
          </p>
        </section>
      </ng-template>

      <ng-template #portfolioNotFound>
        <section class="m-4">
          <p class="text-center text-xl">You have no portfolio.</p>
        </section>
      </ng-template>

      <ng-template #notConnected>
        <section class="m-4">
          <p class="text-center text-xl">
            You have to be connected to see your portfolio.
          </p>
          <button
            class="block mx-auto"
            mat-raised-button
            color="primary"
            (click)="onConnectWallet()"
          >
            Connect
          </button>
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
  connected$ = this.walletService.connected$;

  constructor(
    private viewPortfolioStore: ViewPortfolioStore,
    private walletService: SolanaDappWalletService,
    private connectWalletService: ConnectWalletService,
    private sendFundsService: SendFundsService
  ) {}

  ngOnInit() {
    this.viewPortfolioStore.init();
  }

  onConnectWallet() {
    this.connectWalletService.open();
  }

  onSendFunds(position: Position) {
    this.sendFundsService.open(position);
  }
}
