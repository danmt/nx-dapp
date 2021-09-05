import { Injectable } from '@angular/core';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { isNotNull } from '@nx-dapp/shared/utils/operators';
import {
  getBalanceForWallet,
  getBalancesFromWallet,
} from '@nx-dapp/solana-dapp/balance';
import { Balance } from '@nx-dapp/solana-dapp/utils/types';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface ViewModel {
  balances: Balance[];
  walletBalance: Balance | null;
}

@Injectable()
export class BalancesStore extends ComponentStore<ViewModel> {
  readonly balances$ = this.select((state) => state.balances);
  readonly walletBalance$ = this.select((state) => state.walletBalance);

  constructor(
    private connectionStore: ConnectionStore,
    private walletStore: WalletStore
  ) {
    super({ balances: [], walletBalance: null });
  }

  readonly getBalances = this.effect(() => {
    return combineLatest([
      this.connectionStore.connection$.pipe(isNotNull),
      this.walletStore.publicKey$.pipe(
        isNotNull,
        map((publicKey) => publicKey.toBase58())
      ),
    ]).pipe(
      switchMap(([connection, walletAddress]) =>
        getBalancesFromWallet({ connection, walletAddress }).pipe(
          tapResponse(
            (balances) => this.patchState({ balances }),
            (error) => this.logError(error)
          )
        )
      )
    );
  });

  readonly getWalletBalance = this.effect(() => {
    return combineLatest([
      this.connectionStore.connection$.pipe(isNotNull),
      this.walletStore.publicKey$.pipe(
        isNotNull,
        map((publicKey) => publicKey.toBase58())
      ),
    ]).pipe(
      switchMap(([connection, walletAddress]) =>
        getBalanceForWallet({ connection, walletAddress }).pipe(
          tapResponse(
            (walletBalance) => this.patchState({ walletBalance }),
            (error) => this.logError(error)
          )
        )
      )
    );
  });

  private logError(error: unknown) {
    console.error(error);
  }
}
