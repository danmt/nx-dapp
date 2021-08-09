import { Injectable, OnDestroy } from '@angular/core';
import {
  DEFAULT_WALLET,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
  WalletClient,
  WalletName,
} from '@nx-dapp/solana-dapp/wallet';
import { map, takeUntil } from 'rxjs/operators';

import { SolanaDappNetworkService } from '.';

@Injectable()
export class SolanaDappWalletService extends WalletClient implements OnDestroy {
  walletAddress$ = this.publicKey$.pipe(
    map((publicKey) => publicKey?.toBase58() || null)
  );

  constructor(private solanaDappNetworkService: SolanaDappNetworkService) {
    super(
      [
        getSolletWallet(),
        getPhantomWallet(),
        getSolongWallet(),
        getSolflareWallet(),
      ],
      DEFAULT_WALLET
    );

    this.solanaDappNetworkService.network$
      .pipe(takeUntil(this.destroy$))
      .subscribe((network) => this.setNetwork(network));
  }

  ngOnDestroy() {
    this.destroy();
  }

  selectAndConnect(walletName: WalletName) {
    this.selectWallet(walletName);
    setTimeout(() => this.connect());
  }
}
