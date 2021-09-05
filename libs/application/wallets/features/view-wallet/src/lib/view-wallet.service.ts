import { Injectable, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ViewWalletComponent } from './view-wallet.component';

@Injectable()
export class ViewWalletService {
  constructor(private matDialog: MatDialog) {}

  open(viewContainerRef: ViewContainerRef) {
    this.matDialog.open(ViewWalletComponent, {
      hasBackdrop: true,
      viewContainerRef,
    });
  }
}
