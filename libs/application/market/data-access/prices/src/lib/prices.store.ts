import { Injectable } from '@angular/core';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { isNotNull } from '@nx-dapp/shared/utils/operators';
import { getPricesFromWallet } from '@nx-dapp/solana-dapp/market';
import { TokenPrice } from '@nx-dapp/solana-dapp/utils/types';
import { Connection } from '@solana/web3.js';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface ViewModel {
  prices: TokenPrice[];
  marketConnection: Connection;
}

@Injectable()
export class PricesStore extends ComponentStore<ViewModel> {
  readonly prices$ = this.select((state) => state.prices);
  readonly marketConnection$ = this.select((state) => state.marketConnection);

  constructor(
    private connectionStore: ConnectionStore,
    private walletStore: WalletStore
  ) {
    super({
      prices: [],
      marketConnection: new Connection('https://solana-api.projectserum.com/'),
    });
  }

  readonly getPricesFromWallet = this.effect(() => {
    return combineLatest([
      this.connectionStore.connection$.pipe(isNotNull),
      this.marketConnection$,
      this.walletStore.publicKey$.pipe(
        isNotNull,
        map((publicKey) => publicKey.toBase58())
      ),
    ]).pipe(
      switchMap(([connection, marketConnection, walletAddress]) =>
        getPricesFromWallet({
          connection,
          marketConnection,
          walletAddress,
        }).pipe(
          tapResponse(
            (prices) => this.patchState({ prices }),
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
