import { Injectable, OnDestroy } from '@angular/core';
import { Network } from '@nx-dapp/solana-dapp/network';
import {
  DEFAULT_WALLET,
  getPhantomWallet,
  getSolletWallet,
  getSolongWallet,
  WalletClient,
  WalletName,
} from '@nx-dapp/solana-dapp/wallet';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { SolanaDappNetworkService } from '.';

@Injectable({
  providedIn: 'root',
})
export class SolanaDappWalletService implements OnDestroy {
  private readonly destroy = new Subject();
  private readonly _walletClient = new WalletClient(
    [getSolletWallet(), getPhantomWallet(), getSolongWallet()],
    DEFAULT_WALLET
  );
  wallets$ = this._walletClient.wallets$;
  walletAddress$ = this._walletClient.publicKey$.pipe(
    map((publicKey) => publicKey?.toBase58() || null)
  );
  connected$ = this._walletClient.connected$.pipe(
    map((connected) => connected)
  );

  constructor(private solanaDappNetworkService: SolanaDappNetworkService) {
    this.solanaDappNetworkService.network$
      .pipe(takeUntil(this.destroy))
      .subscribe((network) => this.setNetwork(network));
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
    this._walletClient.destroy();
  }

  setNetwork(network: Network) {
    this._walletClient.setNetwork(network);
  }

  selectWallet(walletName: WalletName) {
    this._walletClient.selectWallet(walletName);
  }

  connect() {
    this._walletClient.connect();
  }

  disconnect() {
    this._walletClient.disconnect();
  }
}
