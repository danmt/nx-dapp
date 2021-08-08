import { Injectable } from '@angular/core';
import {
  DEFAULT_NETWORK,
  Network,
  NETWORKS,
} from '@nx-dapp/solana-dapp/network';
import { getTokens } from '@nx-dapp/solana-dapp/token';
import { BehaviorSubject } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

@Injectable()
export class SolanaDappNetworkService {
  private readonly networkSubject = new BehaviorSubject(DEFAULT_NETWORK);
  network$ = this.networkSubject.asObservable();
  tokens$ = this.network$.pipe(
    switchMap(({ chainID }) => getTokens(chainID)),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  networks = NETWORKS;
  defaultNetwork = DEFAULT_NETWORK;

  changeNetwork(network: Network) {
    this.networkSubject.next(network);
  }
}
