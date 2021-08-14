import { Injectable } from '@angular/core';
import { getTokenAccount, TokenAccount } from '@nx-dapp/solana-dapp/account';
import { PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { concatMap, first } from 'rxjs/operators';

import { SolanaDappConnectionService } from '.';

@Injectable()
export class SolanaDappAccountService {
  constructor(private connectionService: SolanaDappConnectionService) {}

  getTokenAccount(publicKey: PublicKey): Observable<TokenAccount | null> {
    return this.connectionService.connection$.pipe(
      first(),
      concatMap((connection) => getTokenAccount(connection, publicKey))
    );
  }
}
