import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  fromAdapterEvent,
  isNotNull,
  WalletStore,
} from '@danmt/wallet-adapter-angular';
import { merge, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

enum MessageTypes {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

@Injectable()
export class WalletNotificationsService implements OnDestroy {
  private readonly _destroy = new Subject();
  private readonly _walletConnected$ = this.walletStore.adapter$.pipe(
    isNotNull,
    fromAdapterEvent('connect'),
    tap(() => this.showMessage('Wallet connected!', MessageTypes.Success, 3000))
  );
  private readonly _walletDisconnected$ = this.walletStore.adapter$.pipe(
    isNotNull,
    fromAdapterEvent('disconnect'),
    tap(() =>
      this.showMessage('Wallet disconnected!', MessageTypes.Success, 3000)
    )
  );
  private readonly _walletWindowClosedError$ = this.walletStore.adapter$.pipe(
    isNotNull,
    fromAdapterEvent('error'),
    filter(
      (error): error is Error =>
        error instanceof Error && error.name === 'WalletWindowClosedError'
    ),
    tap((error) => this.showMessage(error.message, MessageTypes.Error))
  );

  constructor(
    private snackBar: MatSnackBar,
    private walletStore: WalletStore
  ) {}

  init() {
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

  private showMessage(message: string, type: MessageTypes, duration?: number) {
    this.snackBar.open(message, 'Close', {
      panelClass: `${type}-snackbar`,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration,
    });
  }
}
