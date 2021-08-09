import { Injectable, OnDestroy } from '@angular/core';
import { Network } from '@nx-dapp/solana-dapp/network';
import {
  DEFAULT_WALLET,
  getPhantomWallet,
  getSolflareWallet,
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
    [
      getSolletWallet(),
      getPhantomWallet(),
      getSolongWallet(),
      getSolflareWallet(),
    ],
    DEFAULT_WALLET
  );
  wallets$ = this._walletClient.wallets$;
  selectedWallet$ = this._walletClient.selectedWallet$;
  connected$ = this._walletClient.connected$;
  connecting$ = this._walletClient.connecting$;
  disconnecting$ = this._walletClient.disconnecting$;
  walletAddress$ = this._walletClient.publicKey$.pipe(
    map((publicKey) => publicKey?.toBase58() || null)
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

  connect(walletName: WalletName) {
    this._walletClient.selectWallet(walletName);
    setTimeout(() => this._walletClient.connect());
  }

  disconnect() {
    this._walletClient.disconnect();
  }
}
