import { Injectable, ViewContainerRef } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { TransactionsInProcessComponent } from './transactions-in-process.component';

@Injectable()
export class TransactionsInProcessService {
  constructor(private matBottomSheet: MatBottomSheet) {}

  open(viewContainerRef: ViewContainerRef) {
    this.matBottomSheet.open(TransactionsInProcessComponent, {
      hasBackdrop: true,
      viewContainerRef,
    });
  }
}
