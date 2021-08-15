import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Position } from '@nx-dapp/application/portfolios/utils';
import { isNotNull } from '@nx-dapp/shared/utils/operators';
import {
  getAssociatedTokenPublicKey,
  SolanaDappAccountService,
  SolanaDappTransactionService,
  TokenAccount,
} from '@nx-dapp/solana-dapp/angular';
import { PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import {
  concatMap,
  debounceTime,
  map,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

export interface ViewModel {
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

  constructor(
    private transactionService: SolanaDappTransactionService,
    private accountService: SolanaDappAccountService
  ) {
    super({
      recipientAddress: null,
      associatedTokenAccount: null,
      position: null,
      loading: false,
    });
  }

  readonly setPosition = this.updater((state, position: Position) => ({
    ...state,
    position,
  }));

  readonly setRecipientAddress = this.updater(
    (state, recipientAddress: string | null) => ({
      ...state,
      recipientAddress,
      associatedTokenAccount: null,
      loading: true,
    })
  );

  readonly setAssociatedTokenAccount = this.updater(
    (state, associatedTokenAccount: TokenAccount | null) => ({
      ...state,
      associatedTokenAccount,
      loading: false,
    })
  );

  readonly clearRecipientAddress = this.updater((state) => ({
    ...state,
    recipientAddress: null,
    associatedTokenAccount: null,
  }));

  readonly clearAssociatedTokenAccount = this.effect(
    (recipientAddress$: Observable<string>) => {
      return recipientAddress$.pipe(
        tapResponse(
          () => this.setAssociatedTokenAccount(null),
          (error) => this.logError(error)
        )
      );
    }
  );

  readonly sendTransfer = this.effect((amount$: Observable<number>) =>
    amount$.pipe(
      withLatestFrom(this.position$, this.associatedTokenAccount$),
      tapResponse(
        ([amount, position, associatedTokenAccount]) => {
          if (position?.associatedTokenAddress && associatedTokenAccount) {
            this.transactionService.createSplTransfer(
              position.associatedTokenAddress,
              associatedTokenAccount.pubkey.toBase58(),
              position.address,
              amount,
              position.decimals,
              position.symbol,
              position.logo
            );
          }
        },
        (error) => this.logError(error)
      )
    )
  );

  readonly getAssociatedTokenAccount = this.effect(
    (recipientAddress$: Observable<string>) => {
      return recipientAddress$.pipe(
        tap((recipientAddress) => this.setRecipientAddress(recipientAddress)),
        debounceTime(400),
        withLatestFrom(this.mintAddress$.pipe(isNotNull)),
        concatMap(([recipientAddress, mintAddress]) =>
          getAssociatedTokenPublicKey(
            new PublicKey(recipientAddress),
            new PublicKey(mintAddress)
          ).pipe(
            map((associatedTokenPublicKey) =>
              associatedTokenPublicKey.toBase58()
            )
          )
        ),
        concatMap((associatedTokenAddress) =>
          this.accountService.getTokenAccount(
            new PublicKey(associatedTokenAddress)
          )
        ),
        tapResponse(
          (associatedTokenAccount) =>
            this.setAssociatedTokenAccount(associatedTokenAccount),
          (error) => this.logError(error)
        )
      );
    }
  );

  private logError(error: unknown) {
    console.error(error);
  }

  init(
    position: Position,
    validRecipientAddress$: Observable<string>,
    invalidRecipientAddress$: Observable<string>
  ) {
    this.setPosition(position);
    this.clearAssociatedTokenAccount(invalidRecipientAddress$);
    this.getAssociatedTokenAccount(validRecipientAddress$);
  }
}
