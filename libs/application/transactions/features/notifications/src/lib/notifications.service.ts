import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransactionsStore } from '@nx-dapp/application/transactions/data-access/transactions';
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
    this.transactionsStore.transactionConfirmed$.pipe(
      tap(() =>
        this.showMessage('Transaction confirmed', MessageTypes.Success, 3000)
      )
    );
  private readonly _transactionCancelled$ =
    this.transactionsStore.transactionCancelled$.pipe(
      tap(() =>
        this.showMessage('Transaction cancelled', MessageTypes.Warning, 3000)
      )
    );

  constructor(
    private snackBar: MatSnackBar,
    private transactionsStore: TransactionsStore
  ) {}

  init() {
    merge(this._transactionConfirmed$, this._transactionCancelled$)
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
