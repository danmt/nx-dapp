import { Injectable } from '@angular/core';
import {
  Balance,
  getBalance,
  getBalanceForWallet,
  getBalances,
  getBalancesFromWallet,
} from '@nx-dapp/solana-dapp/balance';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { SolanaDappConnectionService, SolanaDappWalletService } from '.';

@Injectable({
  providedIn: 'root',
})
export class SolanaDappBalanceService {
  constructor(
    private solanaDappConnectionService: SolanaDappConnectionService,
    private solanaDappWalletService: SolanaDappWalletService
  ) {}

  getBalance(mintAddress: string): Observable<Balance | null> {
    return combineLatest([
      this.solanaDappConnectionService.connection$,
      this.solanaDappWalletService.walletAddress$,
    ]).pipe(
      switchMap(([connection, walletAddress]) => {
        if (!walletAddress) {
          return of(null);
        }

        return getBalance({ connection, walletAddress, mintAddress });
      })
    );
  }

  getBalances(mintAddresses: string[]): Observable<Balance[]> {
    return combineLatest([
      this.solanaDappConnectionService.connection$,
      this.solanaDappWalletService.walletAddress$,
    ]).pipe(
      switchMap(([connection, walletAddress]) => {
        if (!walletAddress) {
          return of([]);
        }

        return getBalances({ connection, walletAddress, mintAddresses });
      })
    );
  }

  getBalancesFromWallet(): Observable<Balance[]> {
    return combineLatest([
      this.solanaDappConnectionService.connection$,
      this.solanaDappWalletService.walletAddress$,
    ]).pipe(
      switchMap(([connection, walletAddress]) => {
        if (!walletAddress) {
          return of([]);
        }

        return getBalancesFromWallet({ connection, walletAddress });
      })
    );
  }

  getBalanceForWallet(): Observable<Balance | null> {
    return combineLatest([
      this.solanaDappConnectionService.connection$,
      this.solanaDappWalletService.walletAddress$,
    ]).pipe(
      switchMap(([connection, walletAddress]) => {
        if (!walletAddress) {
          return of(null);
        }

        return getBalanceForWallet({ connection, walletAddress });
      })
    );
  }
}
