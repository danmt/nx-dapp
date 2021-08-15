import { Injectable } from '@angular/core';
import { Connection } from '@solana/web3.js';
import { of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { SolanaDappNetworkService } from '.';

@Injectable()
export class SolanaDappConnectionService {
  connection$ = this.networkService.network$.pipe(
    map(({ url }) => new Connection(url, 'recent')),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  transactionConnection$ = this.networkService.network$.pipe(
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

  constructor(private networkService: SolanaDappNetworkService) {}
}
