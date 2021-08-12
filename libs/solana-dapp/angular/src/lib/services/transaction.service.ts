import { Injectable, OnDestroy } from '@angular/core';
import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { TransactionClient } from '@nx-dapp/solana-dapp/transaction';
import { merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { SolanaDappNetworkService, SolanaDappWalletService } from '.';

@Injectable()
export class SolanaDappTransactionService
  extends TransactionClient
  implements OnDestroy
{
  private setNetwork$ = this.networkService.network$.pipe(
    tap((network) => this.setNetwork(network))
  );

  private setWalletAddress$ = this.walletService.walletAddress$.pipe(
    isNotNull,
    tap((walletAddress) => this.setWalletAddress(walletAddress))
  );

  private signTransaction$ = this.onTransactionCreated$.pipe(
    tap((transaction) => this.walletService.signTransaction(transaction))
  );

  private sendTransaction$ = this.walletService.onTransactionSigned$.pipe(
    tap((transaction) => this.sendTransaction(transaction))
  );

  constructor(
    private networkService: SolanaDappNetworkService,
    private walletService: SolanaDappWalletService
  ) {
    super();

    merge(
      this.setNetwork$,
      this.setWalletAddress$,
      this.sendTransaction$,
      this.signTransaction$
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy();
  }
}
