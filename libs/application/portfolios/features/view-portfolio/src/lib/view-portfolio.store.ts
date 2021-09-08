import { Injectable } from '@angular/core';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { PricesStore } from '@nx-dapp/application/market/data-access/prices';
import { NetworksStore } from '@nx-dapp/application/networks/data-access/networks';
import {
  createPortfolio,
  Portfolio,
} from '@nx-dapp/application/portfolios/utils';
import { BalancesStore } from '@nx-dapp/application/wallets/data-access/balances';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface ViewModel {
  portfolio: Portfolio | null;
}

@Injectable()
export class ViewPortfolioStore extends ComponentStore<ViewModel> {
  connected$ = this.walletStore.connected$;
  portfolio$ = this.select((state) => state.portfolio);

  constructor(
    private pricesStore: PricesStore,
    private balancesStore: BalancesStore,
    private walletStore: WalletStore,
    private networksStore: NetworksStore
  ) {
    super({ portfolio: null });
  }

  readonly getPortfolio = this.effect(() =>
    combineLatest([
      this.balancesStore.balances$,
      this.pricesStore.prices$,
      this.networksStore.tokens$,
    ]).pipe(
      map(([balances, prices, tokens]) =>
        createPortfolio(balances, prices, tokens)
      ),
      tapResponse(
        (portfolio) => this.patchState({ portfolio }),
        (error) => this.logError(error)
      )
    )
  );

  readonly reset = this.effect(() =>
    this.connected$.pipe(
      filter((connected) => !connected),
      tapResponse(
        () => this.patchState({ portfolio: null }),
        (error) => this.logError(error)
      )
    )
  );

  private logError(error: unknown) {
    console.error(error);
  }
}
