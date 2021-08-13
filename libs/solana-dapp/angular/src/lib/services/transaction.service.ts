import { Injectable, OnDestroy } from '@angular/core';
import { isNotNull } from '@nx-dapp/shared/utils/operators';
import { getAssociatedTokenAccount } from '@nx-dapp/solana-dapp/account';
import { TransactionClient } from '@nx-dapp/solana-dapp/transaction';
import { PublicKey } from '@solana/web3.js';
import { merge } from 'rxjs';
import { first, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { SolanaDappNetworkService, SolanaDappWalletService } from '.';

@Injectable()
export class SolanaDappTransactionService
  extends TransactionClient
  implements OnDestroy
{
  id = uuid();

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

  private walletDisconnected$ = this.walletService.onDisconnect$.pipe(
    tap(() => this.reset())
  );

  private cancelTransaction$ =
    this.walletService.onTransactionSignatureFail$.pipe(
      tap((transactionId) => this.cancelTransaction(transactionId))
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
      this.signTransaction$,
      this.cancelTransaction$,
      this.walletDisconnected$
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  getAssociatedTokenAccount(publicKey: PublicKey, mintPublicKey: PublicKey) {
    return this.connection$.pipe(
      first(),
      mergeMap((connection) =>
        getAssociatedTokenAccount(connection, publicKey, mintPublicKey)
      )
    );
  }

  ngOnDestroy() {
    this.destroy();
  }
}
