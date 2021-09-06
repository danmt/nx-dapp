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

import { SplTransferStore } from './spl-transfer.store';
import { SplTransferData } from './types';

@Component({
  selector: 'nx-dapp-spl-transfer',
  template: `
    <header nxDappModalHeader class="mr-8">
      <h1>Send funds (Spl)</h1>
      <p>Complete the form and hit send.</p>
    </header>

    <form [formGroup]="splTransferGroup" class="flex flex-col gap-4">
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
        <mat-hint *ngIf="!submitted || amountControl.valid"
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
          (recipientAssociatedAddress$ | async) === null
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
        [disabled]="submitted && splTransferGroup.invalid"
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
  providers: [SplTransferStore],
})
export class SplTransferComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'block w-72 relative';
  private readonly _destroy = new Subject();
  loading$ = this.splTransferStore.loading$;
  recipientAssociatedAddress$ =
    this.splTransferStore.recipientAssociatedAddress$;
  submitted = false;
  splTransferGroup = new FormGroup({
    recipientAddress: new FormControl('', [
      Validators.required,
      base58Validator,
    ]),
    amount: new FormControl(null, { validators: [Validators.required] }),
    recipientAssociatedAddress: new FormControl(null, {
      validators: [Validators.required],
    }),
  });

  get recipientAddressControl() {
    return this.splTransferGroup.get('recipientAddress') as FormControl;
  }

  get amountControl() {
    return this.splTransferGroup.get('amount') as FormControl;
  }

  get recipientAssociatedAddressControl() {
    return this.splTransferGroup.get(
      'recipientAssociatedAddress'
    ) as FormControl;
  }

  constructor(
    private dialogRef: MatDialogRef<SplTransferComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SplTransferData,
    private splTransferStore: SplTransferStore
  ) {}

  ngOnInit() {
    this.splTransferStore.recipientAssociatedAddress$
      .pipe(takeUntil(this._destroy))
      .subscribe((recipientAssociatedAddress) => {
        this.recipientAssociatedAddressControl.setValue(
          recipientAssociatedAddress
        );
      });

    this.splTransferStore.patchState({ position: this.data.position });
    this.splTransferStore.clearAssociatedTokenAccount(
      this.recipientAddressControl.valueChanges.pipe(
        filter(() => this.recipientAddressControl.invalid)
      )
    );
    this.splTransferStore.getAssociatedTokenAccount(
      this.recipientAddressControl.valueChanges.pipe(
        filter(() => this.recipientAddressControl.valid)
      )
    );
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  onSend() {
    this.submitted = true;
    this.splTransferGroup.markAllAsTouched();

    if (this.splTransferGroup.valid) {
      this.splTransferStore.sendTransfer(this.amountControl.value);
      this.dialogRef.close();
    }
  }
}
