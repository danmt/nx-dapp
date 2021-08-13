import { Pipe, PipeTransform } from '@angular/core';
import { obscureAddress } from '@nx-dapp/solana-dapp/angular';

@Pipe({
  name: 'obscureAddress',
})
export class ObscureAddressPipe implements PipeTransform {
  transform(value: string | null): string {
    if (value === null) {
      return '';
    }

    return obscureAddress(value);
  }
}
