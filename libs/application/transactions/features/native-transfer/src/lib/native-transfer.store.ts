import { Injectable } from '@angular/core';
import { ConnectionStore } from '@danmt/wallet-adapter-angular';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { isNotNull } from '@nx-dapp/shared/utils/operators';
import { getNativeAccount, TokenAccount } from '@nx-dapp/solana-dapp/account';
import { PublicKey } from '@solana/web3.js';
import { Observable, of } from 'rxjs';
import { concatMap, tap, withLatestFrom } from 'rxjs/operators';

export interface ViewModel {
  recipientAddress: string | null;
  recipientAccount: TokenAccount | null;
  loading: boolean;
}

@Injectable()
export class NativeTransferStore extends ComponentStore<ViewModel> {
  readonly recipientAddress$ = this.select((state) => state.recipientAddress);
  readonly recipientAccount$ = this.select((state) => state.recipientAccount);
  readonly loading$ = this.select((state) => state.loading);

  constructor(private connectionStore: ConnectionStore) {
    super({
      recipientAddress: null,
      recipientAccount: null,
      loading: false,
    });
  }

  readonly getRecipientAccount = this.effect(
    (recipientAddress$: Observable<string | null>) =>
      recipientAddress$.pipe(
        tap((recipientAddress) =>
          this.patchState({
            loading: true,
            recipientAddress,
            recipientAccount: null,
          })
        ),
        isNotNull,
        concatMap((recipientAddress) =>
          of(null).pipe(
            withLatestFrom(this.connectionStore.connection$.pipe(isNotNull)),
            concatMap(([, connection]) =>
              getNativeAccount(connection, new PublicKey(recipientAddress))
            )
          )
        ),
        tapResponse(
          (recipientAccount) =>
            this.patchState({ recipientAccount, loading: false }),
          (error) => this.logError(error)
        )
      )
  );

  readonly clearRecipientAccount = this.effect(
    (recipientAddress$: Observable<string | null>) =>
      recipientAddress$.pipe(
        tapResponse(
          () => this.patchState({ recipientAccount: null, loading: false }),
          (error) => this.logError(error)
        )
      )
  );

  private logError(error: unknown) {
    console.error(error);
  }
}
