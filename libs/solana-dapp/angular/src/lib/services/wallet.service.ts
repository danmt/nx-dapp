import { Injectable } from '@angular/core';
import {
  DEFAULT_WALLET,
  getPhantomWallet,
  getSolletWallet,
  getSolongWallet,
  WalletClient,
} from '@nx-dapp/solana-dapp/wallet';
import { map, switchMap } from 'rxjs/operators';

import { SolanaDappConnectionService } from './connection.service';

@Injectable({
  providedIn: 'root',
})
export class SolanaDappWalletService {
  walletClient$ = this.solanaDappConnectionService.connection$.pipe(
    map(() => new WalletClient(this.wallets, DEFAULT_WALLET))
  );
  walletAddress$ = this.walletClient$.pipe(
    switchMap((walletClient) =>
      walletClient.publicKey$.pipe(
        map((publicKey) => publicKey?.toBase58() || null)
      )
    )
  );
  wallets = [getSolletWallet(), getPhantomWallet(), getSolongWallet()];

  constructor(
    private solanaDappConnectionService: SolanaDappConnectionService
  ) {}
}
