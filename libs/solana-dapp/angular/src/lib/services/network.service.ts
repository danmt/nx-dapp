import { Injectable } from '@angular/core';
import {
  DEFAULT_NETWORK,
  Network,
  NETWORKS,
} from '@nx-dapp/solana-dapp/network';
import { getTokens, TokenInfo } from '@nx-dapp/solana-dapp/token';
import { BehaviorSubject } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

@Injectable()
export class SolanaDappNetworkService {
  private readonly networkSubject = new BehaviorSubject(DEFAULT_NETWORK);
  network$ = this.networkSubject.asObservable();
  tokens$ = this.network$.pipe(
    switchMap(({ chainID }) =>
      getTokens(chainID).pipe(
        map((tokens) =>
          tokens.reduce(
            (tokensMap, token) => tokensMap.set(token.address, token),
            new Map<string, TokenInfo>()
          )
        )
      )
    ),
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
