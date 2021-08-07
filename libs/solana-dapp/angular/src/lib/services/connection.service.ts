import { Injectable } from '@angular/core';
import { Connection } from '@solana/web3.js';
import { map } from 'rxjs/operators';

import { SolanaDappNetworkService } from './network.service';

@Injectable({
  providedIn: 'root',
})
export class SolanaDappConnectionService {
  connection$ = this.solanaDappNetworkService.network$.pipe(
    map(({ url }) => new Connection(url, 'recent'))
  );
  marketConnection$ = this.solanaDappNetworkService.network$.pipe(
    map(({ url }) => new Connection(url, 'recent'))
  );

  constructor(private solanaDappNetworkService: SolanaDappNetworkService) {}
}
