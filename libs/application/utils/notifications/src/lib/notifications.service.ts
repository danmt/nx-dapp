import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SolanaDappConnectionService,
  SolanaDappWalletService,
} from '@nx-dapp/solana-dapp/angular';
import { merge, Subject } from 'rxjs';
import { concatMap, filter, switchMap, takeUntil, tap } from 'rxjs/operators';

@Injectable()
export class NotificationsService implements OnDestroy {
  private readonly _destroy = new Subject();
  private readonly _walletConnected$ = this.walletService.onConnect$.pipe(
    tap(() =>
      this.snackBar.open('Wallet connected!', 'Close', {
        duration: 3000,
        panelClass: 'success-snackbar',
      })
    )
  );

  private readonly _walletDisconnected$ = this.walletService.onDisconnect$.pipe(
    tap(() =>
      this.snackBar.open('Wallet disconnected!', 'Close', {
        duration: 3000,
        panelClass: 'success-snackbar',
      })
    )
  );

  private readonly _walletWindowClosedError$ = this.walletService.onError$.pipe(
    filter(({ name }) => name === 'WalletWindowClosedError'),
    tap((error) =>
      this.snackBar.open(error.message, 'Close', {
        duration: 3000,
        panelClass: 'error-snackbar',
      })
    )
  );

  constructor(
    private walletService: SolanaDappWalletService,
    private connectionService: SolanaDappConnectionService,
    private snackBar: MatSnackBar
  ) {}

  init() {
    this.connectionService.connection$
      .pipe(
        switchMap((connection) =>
          this.walletService.onTransactionSigned$.pipe(
            concatMap((transaction) =>
              connection.sendRawTransaction(transaction.serialize())
            ),
            concatMap((transactionId) =>
              connection.confirmTransaction(transactionId)
            )
          )
        )
      )
      .subscribe(() => console.log('transaction succeeded'));

    merge(
      this._walletConnected$,
      this._walletDisconnected$,
      this._walletWindowClosedError$
    )
      .pipe(takeUntil(this._destroy))
      .subscribe();
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
