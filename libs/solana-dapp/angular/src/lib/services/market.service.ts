import { Injectable } from '@angular/core';
import {
  getPrice,
  getPrices,
  getPricesFromWallet,
  TokenPrice,
} from '@nx-dapp/solana-dapp/market';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { SolanaDappWalletService } from '.';
import { SolanaDappConnectionService } from './connection.service';

@Injectable({
  providedIn: 'root',
})
export class SolanaDappMarketService {
  constructor(
    private solanaDappConnectionService: SolanaDappConnectionService,
    private solanaDappWalletService: SolanaDappWalletService
  ) {}

  getPrice(mintAddress: string): Observable<TokenPrice | null> {
    return combineLatest([
      this.solanaDappConnectionService.connection$,
      this.solanaDappConnectionService.marketConnection$,
    ]).pipe(
      switchMap(([connection, marketConnection]) =>
        getPrice({ connection, marketConnection, mintAddress })
      )
    );
  }

  getPrices(mintAddresses: string[]): Observable<TokenPrice[]> {
    return combineLatest([
      this.solanaDappConnectionService.connection$,
      this.solanaDappConnectionService.marketConnection$,
    ]).pipe(
      switchMap(([connection, marketConnection]) =>
        getPrices({ connection, marketConnection, mintAddresses })
      )
    );
  }

  getPricesFromWallet(): Observable<TokenPrice[]> {
    return combineLatest([
      this.solanaDappConnectionService.connection$,
      this.solanaDappConnectionService.marketConnection$,
      this.solanaDappWalletService.walletAddress$,
    ]).pipe(
      switchMap(([connection, marketConnection, walletAddress]) => {
        if (!walletAddress) {
          return of([]);
        }

        return getPricesFromWallet({
          connection,
          marketConnection,
          walletAddress,
        });
      })
    );
  }
}
