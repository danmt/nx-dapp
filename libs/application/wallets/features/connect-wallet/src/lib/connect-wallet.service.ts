import { Injectable, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ConnectWalletComponent } from './connect-wallet.component';

@Injectable()
export class ConnectWalletService {
  constructor(private matDialog: MatDialog) {}

  open(viewContainerRef: ViewContainerRef) {
    this.matDialog.open(ConnectWalletComponent, {
      hasBackdrop: true,
      autoFocus: false,
      viewContainerRef,
    });
  }
}
