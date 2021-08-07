import { Injectable } from '@angular/core';
import {
  DEFAULT_WALLET,
  getPhantomWallet,
  getSolletWallet,
  getSolongWallet,
  WalletClient,
  WalletName,
} from '@nx-dapp/solana-dapp/wallet';
import { map, shareReplay, switchMap, take } from 'rxjs/operators';

import { SolanaDappConnectionService } from './connection.service';

@Injectable({
  providedIn: 'root',
})
export class SolanaDappWalletService {
  walletClient$ = this.solanaDappConnectionService.connection$.pipe(
    map(() => new WalletClient(this.wallets, DEFAULT_WALLET)),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  walletAddress$ = this.walletClient$.pipe(
    switchMap((walletClient) =>
      walletClient.publicKey$.pipe(
        map((publicKey) => publicKey?.toBase58() || null)
      )
    )
  );
  connected$ = this.walletClient$.pipe(
    switchMap((walletClient) =>
      walletClient.connected$.pipe(map((connected) => connected))
    )
  );
  wallets = [getSolletWallet(), getPhantomWallet(), getSolongWallet()];

  constructor(
    private solanaDappConnectionService: SolanaDappConnectionService
  ) {}

  selectWallet(walletName: WalletName) {
    this.walletClient$
      .pipe(take(1))
      .subscribe((walletClient) => walletClient.selectWallet(walletName));
  }

  connect() {
    this.walletClient$
      .pipe(take(1))
      .subscribe((walletClient) => walletClient.connect());
  }

  disconnect() {
    this.walletClient$
      .pipe(take(1))
      .subscribe((walletClient) => walletClient.disconnect());
  }
}
