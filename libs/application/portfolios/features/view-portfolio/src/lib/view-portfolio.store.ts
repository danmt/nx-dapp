import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  createPortfolio,
  Portfolio,
} from '@nx-dapp/application/portfolios/utils';
import {
  Balance,
  SolanaDappBalanceService,
  SolanaDappMarketService,
  SolanaDappNetworkService,
  SolanaDappWalletService,
  TokenInfo,
  TokenPrice,
} from '@nx-dapp/solana-dapp/angular';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

export interface ViewModel {
  prices: TokenPrice[];
  balances: Balance[];
  tokens: Map<string, TokenInfo>;
}

@Injectable()
export class ViewPortfolioStore extends ComponentStore<ViewModel> {
  readonly portfolio$: Observable<Portfolio | null> = this.select((state) =>
    createPortfolio(state.balances, state.prices, state.tokens)
  );

  constructor(
    private balanceService: SolanaDappBalanceService,
    private marketService: SolanaDappMarketService,
    private networkService: SolanaDappNetworkService,
    private walletService: SolanaDappWalletService
  ) {
    super({
      prices: [],
      balances: [],
      tokens: new Map<string, TokenInfo>(),
    });
  }

  readonly setPrices = this.updater((state, prices: TokenPrice[]) => ({
    ...state,
    prices,
  }));

  readonly setBalances = this.updater((state, balances: Balance[]) => ({
    ...state,
    balances,
  }));

  readonly setTokens = this.updater(
    (state, tokens: Map<string, TokenInfo>) => ({
      ...state,
      tokens,
    })
  );

  private readonly getBalances = this.effect(() => {
    return this.walletService.connected$.pipe(
      filter((connected) => connected),
      switchMap(() => this.balanceService.getBalancesFromWallet()),
      tapResponse(
        (balances) => this.setBalances(balances),
        (error) => this.logError(error)
      )
    );
  });

  private readonly getPrices = this.effect(() => {
    return this.walletService.connected$.pipe(
      filter((connected) => connected),
      switchMap(() => this.marketService.getPricesFromWallet()),
      tapResponse(
        (prices) => this.setPrices(prices),
        (error) => this.logError(error)
      )
    );
  });

  private readonly getTokens = this.effect(() => {
    return this.walletService.connected$.pipe(
      filter((connected) => connected),
      switchMap(() => this.networkService.tokens$),
      tapResponse(
        (tokens) => this.setTokens(tokens),
        (error) => this.logError(error)
      )
    );
  });

  private logError(error: unknown) {
    console.error(error);
  }

  init() {
    this.getBalances();
    this.getPrices();
    this.getTokens();
  }
}
