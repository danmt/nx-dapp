import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  ViewContainerRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Position } from '@nx-dapp/application/portfolios/utils';
import { NativeTransferService } from '@nx-dapp/application/transactions/features/native-transfer';
import { SplTransferService } from '@nx-dapp/application/transactions/features/spl-transfer';
import { ConnectWalletComponent } from '@nx-dapp/application/wallets/features/connect-wallet';

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
              <mat-grid-list cols="3" rowHeight="450px" gutterSize="16px">
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
  viewProviders: [ViewPortfolioStore],
})
export class ViewPortfolioComponent {
  @HostBinding('class') class = 'block p-4';
  connected$ = this.viewPortfolioStore.connected$;
  portfolio$ = this.viewPortfolioStore.portfolio$;

  constructor(
    private viewPortfolioStore: ViewPortfolioStore,
    private viewContainerRef: ViewContainerRef,
    private nativeTransferService: NativeTransferService,
    private splTransferService: SplTransferService,
    private matDialog: MatDialog
  ) {}

  onConnectWallet() {
    this.matDialog.open(ConnectWalletComponent, {
      hasBackdrop: true,
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
    });
  }

  onSendFunds(position: Position) {
    if (position.isNative) {
      this.nativeTransferService.open(position, this.viewContainerRef);
    } else {
      this.splTransferService.open(position, this.viewContainerRef);
    }
  }
}
