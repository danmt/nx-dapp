import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  mapToPortfolio,
  Portfolio,
} from '@nx-dapp/application/portfolios/utils';
import {
  SolanaDappBalanceService,
  SolanaDappMarketService,
  SolanaDappNetworkService,
  SolanaDappWalletService,
} from '@nx-dapp/solana-dapp/angular';
import { combineLatest, Observable } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';

export interface ViewModel {
  portfolio: Portfolio;
}

@Injectable()
export class ViewPortfolioStore extends ComponentStore<ViewModel> {
  readonly portfolio$: Observable<Portfolio | null> = this.select(
    (state) => state.portfolio
  );

  constructor(
    private balanceService: SolanaDappBalanceService,
    private marketService: SolanaDappMarketService,
    private networkService: SolanaDappNetworkService,
    private walletService: SolanaDappWalletService
  ) {
    super({
      portfolio: {
        positions: [],
        totalInUSD: 0,
        stableCoinsTotalInUSD: 0,
        nonStableCoinsTotalInUSD: 0,
      },
    });
  }

  readonly setPortfolio = this.updater((state, portfolio: Portfolio) => ({
    ...state,
    portfolio,
  }));

  readonly init = this.effect(() => {
    return this.walletService.connected$.pipe(
      filter((connected) => connected),
      switchMap(() =>
        combineLatest([
          this.balanceService.getBalancesFromWallet(),
          this.networkService.tokens$,
          this.marketService.getPricesFromWallet().pipe(take(3)),
        ])
      ),
      mapToPortfolio,
      tapResponse(
        (portfolio) => this.setPortfolio(portfolio),
        (error) => this.logError(error)
      )
    );
  });

  private logError(error: unknown) {
    console.error(error);
  }
}
