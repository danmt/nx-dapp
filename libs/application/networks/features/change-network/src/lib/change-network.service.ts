import { Injectable, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ChangeNetworkComponent } from './change-network.component';

@Injectable()
export class ChangeNetworkService {
  constructor(private matDialog: MatDialog) {}

  open(viewContainerRef: ViewContainerRef) {
    this.matDialog.open(ChangeNetworkComponent, {
      hasBackdrop: true,
      viewContainerRef,
    });
  }
}
