import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SendFundsComponent } from './send-funds.component';

@Injectable({
  providedIn: 'root',
})
export class SendFundsService {
  constructor(private matDialog: MatDialog) {}

  open() {
    this.matDialog.open(SendFundsComponent, { hasBackdrop: true });
  }
}
