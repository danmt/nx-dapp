import { AbstractControl, ValidationErrors } from '@angular/forms';
import { isPublicKeyAddress } from '@nx-dapp/solana-dapp/utils/operations';

export const base58Validator = (
  control: AbstractControl
): ValidationErrors | null => {
  return !isPublicKeyAddress(control.value) ? { base58: true } : null;
};
