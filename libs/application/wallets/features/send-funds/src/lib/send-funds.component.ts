import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Inject,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import {
  SolanaDappConnectionService,
  SolanaDappWalletService,
} from '@nx-dapp/solana-dapp/angular';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { SendFundsData } from './types';

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

      <mat-form-field class="w-full" appearance="fill">
        <mat-label>Amount</mat-label>
        <input matInput formControlName="amount" type="number" required />
        <mat-hint
          >Maximum amount is {{ data.position.quantity }}
          {{ data.position.symbol }}
        </mat-hint>
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

  constructor(
    private dialogRef: MatDialogRef<SendFundsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SendFundsData,
    private connectionService: SolanaDappConnectionService,
    private walletService: SolanaDappWalletService
  ) {}

  onSendFunds() {
    this.submitted = true;

    if (this.sendFundsGroup.valid) {
      combineLatest([
        this.connectionService.getRecentBlockhash(),
        this.walletService.publicKey$.pipe(isNotNull),
      ])
        .pipe(
          take(1),
          map(([{ blockhash }, fromPubkey]) =>
            new Transaction({
              recentBlockhash: blockhash,
              feePayer: fromPubkey,
            }).add(
              SystemProgram.transfer({
                fromPubkey: fromPubkey,
                toPubkey: new PublicKey(
                  this.sendFundsGroup.get('recipient')?.value
                ),
                lamports:
                  LAMPORTS_PER_SOL * this.sendFundsGroup.get('amount')?.value ||
                  0,
              })
            )
          )
        )
        .subscribe((transaction) => {
          this.walletService.signTransaction(transaction);
          this.dialogRef.close();
        });
    }
  }
}
