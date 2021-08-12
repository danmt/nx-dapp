import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ConnectWalletComponent } from './connect-wallet.component';

@Injectable()
export class ConnectWalletService {
  constructor(private matDialog: MatDialog) {}

  open() {
    this.matDialog.open(ConnectWalletComponent, {
      hasBackdrop: true,
      autoFocus: false,
    });
  }
}
