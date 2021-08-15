import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Position } from '@nx-dapp/application/portfolios/utils';

import { SplTransferComponent } from './spl-transfer.component';

@Injectable()
export class SplTransferService {
  constructor(private matDialog: MatDialog) {}

  open(position: Position) {
    this.matDialog.open(SplTransferComponent, {
      hasBackdrop: true,
      data: { position },
    });
  }
}
