import { Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { TransactionsInProcessComponent } from './transactions-in-process.component';

@Injectable()
export class TransactionsInProcessService {
  constructor(private matBottomSheet: MatBottomSheet) {}

  open() {
    this.matBottomSheet.open(TransactionsInProcessComponent, {
      hasBackdrop: true,
    });
  }
}
