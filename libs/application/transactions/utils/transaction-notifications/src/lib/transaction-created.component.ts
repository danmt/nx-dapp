import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'nx-dapp-transaction-created',
  template: `
    <div class="flex gap-4 items-center">
      <mat-spinner color="accent" diameter="32"></mat-spinner>
      <p class="m-0">Making a transaction.</p>
    </div>
    <button
      mat-icon-button
      aria-label="Close transaction notification"
      (click)="close()"
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionCreatedComponent {
  @HostBinding('class') class = 'flex justify-between items-center';

  constructor(
    private snackbarRef: MatSnackBarRef<TransactionCreatedComponent>
  ) {}

  close() {
    this.snackbarRef.dismissWithAction();
  }
}
