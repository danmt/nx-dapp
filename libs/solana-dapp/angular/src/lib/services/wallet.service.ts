import { Injectable, OnDestroy } from '@angular/core';
import { WalletName } from '@nx-dapp/solana-dapp/utils/types';
import {
  DEFAULT_WALLET,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
  WalletClient,
} from '@nx-dapp/solana-dapp/wallet';
import { merge } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import { SolanaDappNetworkService } from '.';

@Injectable()
export class SolanaDappWalletService extends WalletClient implements OnDestroy {
  walletAddress$ = this.publicKey$.pipe(
    map((publicKey) => publicKey?.toBase58() || null)
  );
  setNetwork$ = this.networkService.network$.pipe(
    tap((network) => this.setNetwork(network))
  );

  constructor(private networkService: SolanaDappNetworkService) {
    super(
      [
        getSolletWallet(),
        getPhantomWallet(),
        getSolongWallet(),
        getSolflareWallet(),
      ],
      DEFAULT_WALLET
    );

    merge(this.setNetwork$).pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy() {
    this.destroy();
  }

  selectAndConnect(walletName: WalletName) {
    this.selectWallet(walletName);
    setTimeout(() => this.connect());
  }
}
