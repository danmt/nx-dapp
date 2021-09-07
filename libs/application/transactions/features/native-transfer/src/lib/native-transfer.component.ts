import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { base58Validator } from '@nx-dapp/solana-dapp/angular';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { NativeTransferStore } from './native-transfer.store';
import { NativeTransferData } from './types';
import { TransactionsStore } from '@nx-dapp/application/transactions/data-access/transactions';

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
        <mat-hint *ngIf="!submitted || recipientAddressControl.valid"
          >Enter the receiver's address.</mat-hint
        >

        <mat-error *ngIf="submitted && recipientAddressControl.errors?.required"
          >The recipient is mandatory.</mat-error
        >
        <mat-error *ngIf="submitted && recipientAddressControl.errors?.base58"
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
        <mat-error *ngIf="submitted && amountControl.errors?.required"
          >The amount is mandatory.</mat-error
        >
      </mat-form-field>

      <p
        *ngIf="
          submitted &&
          recipientAddressControl.valid &&
          (loading$ | async) === false &&
          (recipientAccount$ | async) === null
        "
        class="text-center text-warn text-xs m-0"
      >
        Recipient doesn't have account
      </p>

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
  providers: [NativeTransferStore],
})
export class NativeTransferComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'block w-72 relative';
  private readonly _destroy = new Subject();
  loading$ = this.nativeTransferStore.loading$;
  recipientAccount$ = this.nativeTransferStore.recipientAccount$;
  submitted = false;
  nativeTransferGroup = new FormGroup({
    recipientAddress: new FormControl('', [
      Validators.required,
      base58Validator,
    ]),
    amount: new FormControl(null, [Validators.required]),
    recipientAccount: new FormControl(null, {
      validators: [Validators.required],
    }),
  });

  get recipientAddressControl() {
    return this.nativeTransferGroup.get('recipientAddress') as FormControl;
  }

  get amountControl() {
    return this.nativeTransferGroup.get('amount') as FormControl;
  }

  get recipientAccountControl() {
    return this.nativeTransferGroup.get('recipientAccount') as FormControl;
  }

  constructor(
    private dialogRef: MatDialogRef<NativeTransferComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NativeTransferData,
    private nativeTransferStore: NativeTransferStore,
    private transactionsStore: TransactionsStore
  ) {}

  ngOnInit() {
    this.nativeTransferStore.recipientAccount$
      .pipe(takeUntil(this._destroy))
      .subscribe((recipientAccount) =>
        this.recipientAccountControl.setValue(recipientAccount)
      );

    this.nativeTransferStore.getRecipientAccount(
      this.recipientAddressControl.valueChanges.pipe(
        filter(() => this.recipientAddressControl.valid)
      )
    );
    this.nativeTransferStore.clearRecipientAccount(
      this.recipientAddressControl.valueChanges.pipe(
        filter(() => this.recipientAddressControl.invalid)
      )
    );
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  onSend() {
    this.submitted = true;
    this.nativeTransferGroup.markAllAsTouched();

    if (this.nativeTransferGroup.valid) {
      this.transactionsStore.sendNativeTransfer({
        amount: this.amountControl.value,
        recipientAddress: this.recipientAddressControl.value,
      });
      this.dialogRef.close();
    }
  }
}
