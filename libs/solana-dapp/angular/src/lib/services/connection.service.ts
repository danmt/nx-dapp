import { Injectable } from '@angular/core';
import { Connection } from '@solana/web3.js';
import { of } from 'rxjs';
import { concatMap, first, map, shareReplay } from 'rxjs/operators';

import { SolanaDappNetworkService } from '.';

@Injectable({
  providedIn: 'root',
})
export class SolanaDappConnectionService {
  connection$ = this.solanaDappNetworkService.network$.pipe(
    map(({ url }) => new Connection(url, 'recent')),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  marketConnection$ = of(
    new Connection('https://solana-api.projectserum.com/', 'recent')
  ).pipe(
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );

  constructor(private solanaDappNetworkService: SolanaDappNetworkService) {}

  sendRawTransaction(buffer: Buffer) {
    return this.connection$.pipe(
      first(),
      concatMap((connection) => connection.sendRawTransaction(buffer))
    );
  }

  confirmTransaction(txId: string) {
    return this.connection$.pipe(
      first(),
      concatMap((connection) => connection.confirmTransaction(txId))
    );
  }

  getRecentBlockhash() {
    return this.connection$.pipe(
      first(),
      concatMap((connection) => connection.getRecentBlockhash())
    );
  }
}
