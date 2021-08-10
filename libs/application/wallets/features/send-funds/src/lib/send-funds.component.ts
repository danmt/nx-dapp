import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'nx-dapp-send-funds',
  template: `
    <header nxDappModalHeader class="mr-8">
      <h1>Send funds</h1>
      <p>Complete the form and hit send.</p>
    </header>

    <form [formGroup]="sendFundsGroup" class="flex flex-col gap-4">
      <mat-form-field class="w-full" appearance="fill">
        <mat-label>Recipient</mat-label>
        <input matInput formControlName="recipient" required />
        <mat-hint *ngIf="!submitted || sendFundsGroup.get('recipient')?.valid"
          >Enter the receiver's address.</mat-hint
        >
        <mat-error
          *ngIf="submitted && sendFundsGroup.get('recipient')?.errors?.required"
          >The recipient is mandatory.</mat-error
        >
      </mat-form-field>

      <mat-form-field class="w-full">
        <mat-label>Amount</mat-label>
        <input matInput formControlName="amount" type="number" required />
        <mat-hint>Maximum amount is ?</mat-hint>
        <mat-error
          *ngIf="submitted && sendFundsGroup.get('amount')?.errors?.required"
          >The amount is mandatory.</mat-error
        >
      </mat-form-field>

      <p class="text-xs text-center text-warn m-0">
        Make sure you're sending the funds to the right address.
      </p>

      <button
        mat-stroked-button
        color="primary"
        (click)="onSendFunds()"
        class="w-full"
        [disabled]="submitted && sendFundsGroup.invalid"
      >
        Send funds
      </button>
    </form>

    <button
      mat-icon-button
      aria-label="Close connection attempt"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendFundsComponent {
  @HostBinding('class') class = 'block w-72 relative';
  submitted = false;
  sendFundsGroup = new FormGroup({
    recipient: new FormControl('', [Validators.required]),
    amount: new FormControl(null, [Validators.required]),
  });

  constructor(private dialogRef: MatDialogRef<SendFundsComponent>) {}

  onSendFunds() {
    this.submitted = true;

    if (this.sendFundsGroup.valid) {
      console.log(this.sendFundsGroup.value);
      this.dialogRef.close();
    }
  }
}
