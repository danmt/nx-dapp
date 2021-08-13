import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Inject,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  base58Validator,
  SolanaDappTransactionService,
} from '@nx-dapp/solana-dapp/angular';

import { NativeTransferData } from './types';

@Component({
  selector: 'nx-dapp-native-transfer',
  template: `
    <header nxDappModalHeader class="mr-8">
      <h1>Send funds (Native)</h1>
      <p>Complete the form and hit send.</p>
    </header>

    <form [formGroup]="nativeTransferGroup" class="flex flex-col gap-4">
      <mat-form-field class="w-full" appearance="fill">
        <mat-label>Recipient</mat-label>
        <input
          matInput
          formControlName="recipientAddress"
          required
          autocomplete="off"
        />
        <mat-hint *ngIf="!submitted || recipientAddressControl?.valid"
          >Enter the receiver's address.</mat-hint
        >

        <mat-error
          *ngIf="submitted && recipientAddressControl?.errors?.required"
          >The recipient is mandatory.</mat-error
        >
        <mat-error *ngIf="submitted && recipientAddressControl?.errors?.base58"
          >Make sure to use the right format</mat-error
        >
      </mat-form-field>

      <mat-form-field class="w-full" appearance="fill">
        <mat-label>Amount</mat-label>
        <input
          matInput
          formControlName="amount"
          type="number"
          required
          autocomplete="off"
        />
        <mat-hint
          >Maximum amount is {{ data.position.quantity }}
          {{ data.position.symbol }}
        </mat-hint>
        <mat-error *ngIf="submitted && amountControl?.errors?.required"
          >The amount is mandatory.</mat-error
        >
      </mat-form-field>

      <button
        mat-stroked-button
        color="primary"
        (click)="onSend()"
        class="w-full"
        [disabled]="submitted && nativeTransferGroup.invalid"
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
  styles: [
    `
      mat-error + mat-error {
        display: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NativeTransferComponent {
  @HostBinding('class') class = 'block w-72 relative';
  submitted = false;
  nativeTransferGroup = new FormGroup({
    recipientAddress: new FormControl('', [
      Validators.required,
      base58Validator,
    ]),
    amount: new FormControl(null, [Validators.required]),
  });

  get recipientAddressControl() {
    return this.nativeTransferGroup.get('recipientAddress');
  }

  get amountControl() {
    return this.nativeTransferGroup.get('amount');
  }

  constructor(
    private dialogRef: MatDialogRef<NativeTransferComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NativeTransferData,
    private transactionService: SolanaDappTransactionService
  ) {}

  onSend() {
    this.submitted = true;

    if (this.nativeTransferGroup.valid) {
      const recipientAddress = this.recipientAddressControl?.value;
      const amount = this.amountControl?.value;
      this.transactionService.createNativeTransfer(recipientAddress, amount);
      this.dialogRef.close();
    }
  }
}
