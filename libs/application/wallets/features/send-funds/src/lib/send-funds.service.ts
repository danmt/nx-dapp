import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Position } from '@nx-dapp/application/portfolios/utils';

import { SendFundsComponent } from './send-funds.component';

@Injectable({
  providedIn: 'root',
})
export class SendFundsService {
  constructor(private matDialog: MatDialog) {}

  open(position: Position) {
    this.matDialog.open(SendFundsComponent, {
      hasBackdrop: true,
      data: { position },
    });
  }
}
