import { Injectable } from '@angular/core';
import {
  DEFAULT_NETWORK,
  Network,
  NETWORKS,
} from '@nx-dapp/solana-dapp/network';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SolanaDappNetworkService {
  private readonly networkSubject = new BehaviorSubject(DEFAULT_NETWORK);
  network$ = this.networkSubject.asObservable();
  networks = NETWORKS;
  defaultNetwork = DEFAULT_NETWORK;

  changeNetwork(network: Network) {
    this.networkSubject.next(network);
  }
}
