import { Injectable } from '@angular/core';
import { Connection } from '@solana/web3.js';
import { of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { SolanaDappNetworkService } from './network.service';

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
}
