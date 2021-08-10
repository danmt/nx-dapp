import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ViewWalletComponent } from './view-wallet.component';

@Injectable({
  providedIn: 'root',
})
export class ViewWalletService {
  constructor(private matDialog: MatDialog) {}

  open() {
    this.matDialog.open(ViewWalletComponent, {
      hasBackdrop: true,
    });
  }
}
