import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SolanaDappTransactionService,
  SolanaDappWalletService,
} from '@nx-dapp/solana-dapp/angular';
import { merge, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

enum MessageTypes {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

@Injectable()
export class NotificationsService implements OnDestroy {
  private readonly _destroy = new Subject();
  private readonly _walletConnected$ = this.walletService.onConnect$.pipe(
    tap(() => this.showMessage('Wallet connected!', MessageTypes.Success, 3000))
  );
  private readonly _walletDisconnected$ = this.walletService.onDisconnect$.pipe(
    tap(() =>
      this.showMessage('Wallet disconnected!', MessageTypes.Success, 3000)
    )
  );
  private readonly _walletWindowClosedError$ = this.walletService.onError$.pipe(
    filter(({ name }) => name === 'WalletWindowClosedError'),
    tap((error) => this.showMessage(error.message, MessageTypes.Error))
  );
  private readonly _transactionConfirmed$ =
    this.transactionService.onTransactionConfirmed$.pipe(
      tap(() =>
        this.showMessage('Transaction confirmed', MessageTypes.Success, 3000)
      )
    );

  constructor(
    private snackBar: MatSnackBar,
    private walletService: SolanaDappWalletService,
    private transactionService: SolanaDappTransactionService
  ) {}

  init() {
    merge(
      this._walletConnected$,
      this._walletDisconnected$,
      this._walletWindowClosedError$,
      this._transactionConfirmed$
    )
      .pipe(takeUntil(this._destroy))
      .subscribe();
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  private showMessage(message: string, type: MessageTypes, duration?: number) {
    this.snackBar.open(message, 'Close', {
      panelClass: `${type}-snackbar`,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration,
    });
  }
}
