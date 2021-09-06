import { Injectable } from '@angular/core';
import { ConnectionStore } from '@danmt/wallet-adapter-angular';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Position } from '@nx-dapp/application/portfolios/utils';
import { isNotNull } from '@nx-dapp/shared/utils/operators';
import { getTokenAccount } from '@nx-dapp/solana-dapp/account';
import {
  getAssociatedTokenPublicKey,
  TokenAccount,
} from '@nx-dapp/solana-dapp/angular';
import { PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { concatMap, debounceTime, tap, withLatestFrom } from 'rxjs/operators';

export interface ViewModel {
  emitterAddress: string | null;
  recipientAddress: string | null;
  associatedTokenAccount: TokenAccount | null;
  position: Position | null;
  loading: boolean;
}

@Injectable()
export class SplTransferStore extends ComponentStore<ViewModel> {
  readonly position$ = this.select((state) => state.position);
  readonly mintAddress$ = this.select(this.position$, (position) =>
    position ? position.address : null
  );
  readonly associatedTokenAccount$ = this.select(
    (state) => state.associatedTokenAccount
  );
  readonly loading$ = this.select((state) => state.loading);

  constructor(private connectionStore: ConnectionStore) {
    super({
      emitterAddress: null,
      recipientAddress: null,
      associatedTokenAccount: null,
      position: null,
      loading: false,
    });
  }

  readonly clearAssociatedTokenAccount = this.effect(
    (recipientAddress$: Observable<string>) => {
      return recipientAddress$.pipe(
        tapResponse(
          () =>
            this.patchState({ associatedTokenAccount: null, loading: false }),
          (error) => this.logError(error)
        )
      );
    }
  );

  readonly getAssociatedTokenAccount = this.effect(
    (recipientAddress$: Observable<string>) => {
      return recipientAddress$.pipe(
        tap((recipientAddress) =>
          this.patchState({
            recipientAddress,
            associatedTokenAccount: null,
            loading: true,
          })
        ),
        debounceTime(400),
        withLatestFrom(
          this.mintAddress$.pipe(isNotNull),
          this.connectionStore.connection$.pipe(isNotNull)
        ),
        concatMap(([recipientAddress, mintAddress, connection]) =>
          getAssociatedTokenPublicKey(
            new PublicKey(recipientAddress),
            new PublicKey(mintAddress)
          ).pipe(
            concatMap((associatedTokenPublicKey) =>
              getTokenAccount(connection, associatedTokenPublicKey).pipe(
                tapResponse(
                  (associatedTokenAccount) =>
                    this.patchState({ associatedTokenAccount, loading: false }),
                  (error) => this.logError(error)
                )
              )
            )
          )
        )
      );
    }
  );

  private logError(error: unknown) {
    console.error(error);
  }
}
