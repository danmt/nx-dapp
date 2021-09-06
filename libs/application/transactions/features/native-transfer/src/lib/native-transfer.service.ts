import { Injectable, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Position } from '@nx-dapp/application/portfolios/utils';

import { NativeTransferComponent } from './native-transfer.component';

@Injectable()
export class NativeTransferService {
  constructor(private matDialog: MatDialog) {}

  open(position: Position, viewContainerRef: ViewContainerRef) {
    this.matDialog.open(NativeTransferComponent, {
      hasBackdrop: true,
      data: { position },
      viewContainerRef,
    });
  }
}
