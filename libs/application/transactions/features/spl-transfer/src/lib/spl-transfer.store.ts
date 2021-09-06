import { Injectable } from '@angular/core';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Position } from '@nx-dapp/application/portfolios/utils';
import { isNotNull } from '@nx-dapp/shared/utils/operators';
import { getAssociatedTokenPublicKey } from '@nx-dapp/solana-dapp/angular';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, Transaction } from '@solana/web3.js';
import { combineLatest, Observable } from 'rxjs';
import { concatMap, debounceTime, tap, withLatestFrom } from 'rxjs/operators';

export interface ViewModel {
  emitterAddress: string | null;
  recipientAddress: string | null;
  recipientAssociatedAddress: string | null;
  position: Position | null;
  loading: boolean;
}

@Injectable()
export class SplTransferStore extends ComponentStore<ViewModel> {
  readonly position$ = this.select((state) => state.position);
  readonly decimals$ = this.select(this.position$, (position) =>
    position ? position.decimals : null
  );
  readonly mintAddress$ = this.select(this.position$, (position) =>
    position ? position.address : null
  );
  readonly recipientAssociatedAddress$ = this.select(
    (state) => state.recipientAssociatedAddress
  );
  readonly loading$ = this.select((state) => state.loading);
  readonly emitterAddress$ = this.select((state) => state.emitterAddress);

  constructor(
    private connectionStore: ConnectionStore,
    private walletStore: WalletStore
  ) {
    super({
      emitterAddress: null,
      recipientAddress: null,
      recipientAssociatedAddress: null,
      position: null,
      loading: false,
    });
  }

  readonly loadEmitterAddress = this.effect(() =>
    this.position$.pipe(
      isNotNull,
      tap((position) =>
        this.patchState({
          emitterAddress: position.associatedTokenAddress || null,
        })
      )
    )
  );

  readonly clearAssociatedTokenAccount = this.effect(
    (recipientAddress$: Observable<string>) => {
      return recipientAddress$.pipe(
        tapResponse(
          () =>
            this.patchState({
              recipientAssociatedAddress: null,
              loading: false,
            }),
          (error) => this.logError(error)
        )
      );
    }
  );

  readonly sendTransfer = this.effect((amount$: Observable<number>) => {
    return combineLatest([
      amount$,
      this.connectionStore.connection$.pipe(isNotNull),
      this.walletStore.publicKey$.pipe(isNotNull),
    ]).pipe(
      withLatestFrom(
        this.decimals$.pipe(isNotNull),
        this.mintAddress$.pipe(isNotNull),
        this.emitterAddress$.pipe(isNotNull),
        this.recipientAssociatedAddress$.pipe(isNotNull)
      ),
      concatMap(
        ([
          [amount, connection, walletPublicKey],
          decimals,
          mintAddress,
          emitterAddress,
          associatedTokenAccount,
        ]) => {
          return this.walletStore.sendTransaction(
            new Transaction().add(
              Token.createTransferCheckedInstruction(
                TOKEN_PROGRAM_ID,
                new PublicKey(emitterAddress),
                new PublicKey(mintAddress),
                new PublicKey(associatedTokenAccount),
                walletPublicKey,
                [],
                Math.round(amount * 10 ** decimals),
                decimals
              )
            ),
            connection
          );
        }
      )
    );
  });

  readonly getAssociatedTokenAccount = this.effect(
    (recipientAddress$: Observable<string>) => {
      return recipientAddress$.pipe(
        tap((recipientAddress) =>
          this.patchState({
            recipientAddress,
            recipientAssociatedAddress: null,
            loading: true,
          })
        ),
        debounceTime(400),
        withLatestFrom(this.mintAddress$.pipe(isNotNull)),
        concatMap(([recipientAddress, mintAddress]) =>
          getAssociatedTokenPublicKey(
            new PublicKey(recipientAddress),
            new PublicKey(mintAddress)
          ).pipe(
            tapResponse(
              (associatedTokenPublicKey) =>
                this.patchState({
                  recipientAssociatedAddress:
                    associatedTokenPublicKey.toBase58(),
                  loading: false,
                }),
              (error) => this.logError(error)
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
