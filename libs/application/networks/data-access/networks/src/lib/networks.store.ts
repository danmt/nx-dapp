import { Injectable } from '@angular/core';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { DEFAULT_NETWORK, NETWORKS } from '@nx-dapp/solana-dapp/network';
import { getTokens, TokenInfo } from '@nx-dapp/solana-dapp/token';
import { Network } from '@nx-dapp/solana-dapp/utils/types';
import { Observable, of } from 'rxjs';
import { concatMap, map, tap, withLatestFrom } from 'rxjs/operators';

export interface ViewModel {
  networks: Network[];
  selectedNetwork: Network | null;
  tokens: Map<string, TokenInfo>;
}

@Injectable()
export class NetworksStore extends ComponentStore<ViewModel> {
  selectedNetwork$ = this.select((state) => state.selectedNetwork);
  tokens$ = this.select((state) => state.tokens);
  networks$ = this.select((state) => state.networks);

  constructor(private walletStore: WalletStore) {
    super({
      networks: NETWORKS,
      selectedNetwork: null,
      tokens: new Map<string, TokenInfo>(),
    });

    this.initializeNetwork(DEFAULT_NETWORK);
  }

  readonly initializeNetwork = this.effect((network$: Observable<Network>) => {
    return network$.pipe(
      concatMap((network) =>
        getTokens(network.chainID).pipe(
          map((tokens) =>
            tokens.reduce(
              (tokensMap, token) => tokensMap.set(token.address, token),
              new Map<string, TokenInfo>()
            )
          ),
          tapResponse(
            (tokens) => this.patchState({ selectedNetwork: network, tokens }),
            (error) => this.logError(error)
          )
        )
      )
    );
  });

  readonly changeNetwork = this.effect((network$: Observable<Network>) => {
    return network$.pipe(
      concatMap((network) =>
        getTokens(network.chainID).pipe(
          map((tokens) =>
            tokens.reduce(
              (tokensMap, token) => tokensMap.set(token.address, token),
              new Map<string, TokenInfo>()
            )
          ),
          tapResponse(
            (tokens) => this.patchState({ selectedNetwork: network, tokens }),
            (error) => this.logError(error)
          )
        )
      ),
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(this.walletStore.connected$),
          tap((connected) => {
            if (connected) {
              this.walletStore.disconnect();
            }
          })
        )
      )
    );
  });

  private logError(error: unknown) {
    console.error(error);
  }
}
