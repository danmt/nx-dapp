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
import { concatMap, debounceTime, map, withLatestFrom } from 'rxjs/operators';

export interface ViewModel {
  associatedTokenAddress: string | null;
  associatedTokenAccount: TokenAccount | null;
  position: Position | null;
}

@Injectable()
export class SplTransferStore extends ComponentStore<ViewModel> {
  readonly associatedTokenAddress$ = this.select(
    (state) => state.associatedTokenAddress
  );
  readonly position$ = this.select((state) => state.position);
  readonly mintAddress$ = this.select(this.position$, (position) =>
    position ? position.address : null
  );
  readonly associatedTokenAccount$ = this.select(
    (state) => state.associatedTokenAccount
  );

  constructor(
    private transactionService: SolanaDappTransactionService,
    private accountService: SolanaDappAccountService
  ) {
    super({
      associatedTokenAddress: null,
      associatedTokenAccount: null,
      position: null,
    });
  }

  readonly setPosition = this.updater((state, position: Position) => ({
    ...state,
    position,
  }));

  readonly setAssociatedTokenAddress = this.updater(
    (state, associatedTokenAddress: string | null) => ({
      ...state,
      associatedTokenAddress,
      associatedTokenAccount: null,
    })
  );

  readonly setAssociatedTokenAccount = this.updater(
    (state, associatedTokenAccount: TokenAccount | null) => ({
      ...state,
      associatedTokenAccount,
    })
  );

  readonly clearAssociatedTokenAddress = this.updater((state) => ({
    ...state,
    associatedTokenAddress: null,
    associatedTokenAccount: null,
  }));

  readonly getRecipientAssociatedTokenAddress = this.effect(
    (recipientAddress$: Observable<string>) => {
      return recipientAddress$.pipe(
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
        tapResponse(
          (associatedTokenAddress) =>
            this.setAssociatedTokenAddress(associatedTokenAddress),
          (error) => this.logError(error)
        )
      );
    }
  );

  readonly clearRecipientAssociatedTokenAddress = this.effect(
    (recipientAddress$: Observable<string>) => {
      return recipientAddress$.pipe(
        tapResponse(
          () => this.clearAssociatedTokenAddress(),
          (error) => this.logError(error)
        )
      );
    }
  );

  readonly sendTransfer = this.effect((amount$: Observable<number>) =>
    amount$.pipe(
      withLatestFrom(this.position$, this.associatedTokenAddress$),
      tapResponse(
        ([amount, position, associatedTokenAddress]) => {
          if (position?.associatedTokenAddress && associatedTokenAddress) {
            this.transactionService.createSplTransfer(
              position.associatedTokenAddress,
              associatedTokenAddress,
              position.address,
              amount,
              position.decimals
            );
          }
        },
        (error) => this.logError(error)
      )
    )
  );

  readonly getAssociatedTokenAccount = this.effect(
    (associatedTokenAddress$: Observable<string | null>) =>
      associatedTokenAddress$.pipe(
        isNotNull,
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
      )
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
    this.getRecipientAssociatedTokenAddress(validRecipientAddress$);
    this.clearRecipientAssociatedTokenAddress(invalidRecipientAddress$);
    this.getAssociatedTokenAccount(this.associatedTokenAddress$);
  }
}
