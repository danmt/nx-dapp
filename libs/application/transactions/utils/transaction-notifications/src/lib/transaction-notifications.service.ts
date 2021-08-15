import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SolanaDappTransactionService } from '@nx-dapp/solana-dapp/angular';
import { merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

enum MessageTypes {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

@Injectable()
export class TransactionNotificationsService implements OnDestroy {
  private readonly _destroy = new Subject();

  private readonly _transactionConfirmed$ =
    this.transactionService.onTransactionConfirmed$.pipe(
      tap(() =>
        this.showMessage('Transaction confirmed', MessageTypes.Success, 3000)
      )
    );
  private readonly _transactionCancelled$ =
    this.transactionService.onTransactionCancelled$.pipe(
      tap(() =>
        this.showMessage('Transaction cancelled', MessageTypes.Warning, 3000)
      )
    );
  private readonly _transactionFailed$ =
    this.transactionService.onTransactionFailed$.pipe(
      tap(() =>
        this.showMessage('Transaction failed', MessageTypes.Error, 3000)
      )
    );

  constructor(
    private snackBar: MatSnackBar,
    private transactionService: SolanaDappTransactionService
  ) {}

  init() {
    merge(
      this._transactionConfirmed$,
      this._transactionCancelled$,
      this._transactionFailed$
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
