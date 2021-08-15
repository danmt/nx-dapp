import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { isNotNull } from '@nx-dapp/shared/utils/operators';
import {
  SolanaDappAccountService,
  TokenAccount,
} from '@nx-dapp/solana-dapp/angular';
import { PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';

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

  constructor(private accountService: SolanaDappAccountService) {
    super({
      recipientAddress: null,
      recipientAccount: null,
      loading: false,
    });
  }

  readonly setRecipientAccount = this.updater(
    (state, recipientAccount: TokenAccount | null) => ({
      ...state,
      recipientAccount,
      loading: true,
    })
  );

  readonly setRecipientAddress = this.updater(
    (state, recipientAddress: string | null) => ({
      ...state,
      loading: false,
      recipientAddress,
      recipientAccount: null,
    })
  );

  readonly getRecipientAccount = this.effect(
    (recipientAddress$: Observable<string | null>) =>
      recipientAddress$.pipe(
        tap((recipientAddress) => this.setRecipientAddress(recipientAddress)),
        isNotNull,
        concatMap((recipientAddress) =>
          this.accountService.getNativeAccount(new PublicKey(recipientAddress))
        ),
        tapResponse(
          (recipientAccount) => this.setRecipientAccount(recipientAccount),
          (error) => this.logError(error)
        )
      )
  );

  readonly clearRecipientAccount = this.effect(
    (recipientAddress$: Observable<string | null>) =>
      recipientAddress$.pipe(
        tapResponse(
          () => this.setRecipientAccount(null),
          (error) => this.logError(error)
        )
      )
  );

  private logError(error: unknown) {
    console.error(error);
  }

  init(
    validRecipientAddress$: Observable<string>,
    invalidRecipientAddress$: Observable<string>
  ) {
    this.getRecipientAccount(validRecipientAddress$);
    this.clearRecipientAccount(invalidRecipientAddress$);
  }
}
