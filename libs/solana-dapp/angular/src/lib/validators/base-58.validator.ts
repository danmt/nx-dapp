import { AbstractControl, ValidationErrors } from '@angular/forms';
import { PublicKey } from '@solana/web3.js';

export const base58Validator = (
  control: AbstractControl
): ValidationErrors | null => {
  let base58 = false;

  try {
    new PublicKey(control.value);
  } catch (error) {
    base58 = true;
  }

  return base58 ? { base58: true } : null;
};
