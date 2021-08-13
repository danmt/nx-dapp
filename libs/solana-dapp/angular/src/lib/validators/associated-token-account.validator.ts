import { AbstractControl } from '@angular/forms';
import { isPublicKeyAddress } from '@nx-dapp/solana-dapp/utils/operations';
import { PublicKey } from '@solana/web3.js';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SolanaDappTransactionService } from '../services';

export const associatedTokenAccountValidator =
  (transactionService: SolanaDappTransactionService, mintAddress: string) =>
  (control: AbstractControl) => {
    if (!control.value || !isPublicKeyAddress(control.value)) {
      return of(null);
    }
    return transactionService
      .getAssociatedTokenAccount(
        new PublicKey(control.value),
        new PublicKey(mintAddress)
      )
      .pipe(
        map((exists) => (exists ? null : { associatedTokenAccount: true }))
      );
  };
