import { Injectable } from '@angular/core';
import { ConnectionStore, WalletStore } from '@danmt/wallet-adapter-angular';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { isNotNull } from '@nx-dapp/shared/utils/operators';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { concatMap, withLatestFrom } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { NATIVE_MINT, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { NetworksStore } from '@nx-dapp/application/networks/data-access/networks';

export interface TransactionDetails {
  transactionId: string;
  status: string;
  processing: boolean;
  date: Date;
  amount: number;
  logo: string;
  symbol: string;
  signature?: string;
}

export interface ViewModel {
  inProcess: number;
  transactions: TransactionDetails[];
}

@Injectable()
export class TransactionsStore extends ComponentStore<ViewModel> {
  transactions$ = this.select((state) => state.transactions);
  inProcess$ = this.select((state) => state.inProcess);
  processing$ = this.select(this.inProcess$, (inProcess) => inProcess > 0);

  constructor(
    private connectionStore: ConnectionStore,
    private walletStore: WalletStore,
    private networksStore: NetworksStore
  ) {
    super({ transactions: [], inProcess: 0 });

    this.state$.subscribe((a) => console.log(a));
  }

  markAsSending = this.updater(
    (state, transactionDetails: Omit<TransactionDetails, 'status'>) => ({
      ...state,
      transactions: [
        ...state.transactions,
        { ...transactionDetails, status: 'Sending' },
      ],
      inProcess: state.inProcess + 1,
    })
  );

  markAsConfirming = this.updater(
    (state, payload: { id: string; changes: Partial<TransactionDetails> }) => ({
      ...state,
      transactions: state.transactions.map((transaction) =>
        transaction.transactionId === payload.id
          ? { ...transaction, ...payload.changes, status: 'Confirming' }
          : transaction
      ),
    })
  );

  markAsConfirmed = this.updater((state, transactionId: string) => ({
    ...state,
    transactions: state.transactions.map((transaction) =>
      transaction.transactionId === transactionId
        ? {
            ...transaction,
            status: 'Confirmed',
            processing: false,
          }
        : transaction
    ),
    inProcess: state.inProcess - 1,
  }));

  readonly sendNativeTransfer = this.effect(
    (
      nativeTransferConfig$: Observable<{
        amount: number;
        recipientAddress: string;
      }>
    ) => {
      return nativeTransferConfig$.pipe(
        withLatestFrom(
          this.connectionStore.connection$.pipe(isNotNull),
          this.walletStore.publicKey$.pipe(isNotNull),
          this.networksStore.tokens$
        ),
        concatMap(
          ([
            { amount, recipientAddress },
            connection,
            walletPublicKey,
            tokens,
          ]) => {
            const token = tokens.get(NATIVE_MINT.toBase58());
            const transactionId = uuid();
            const transaction = new Transaction().add(
              SystemProgram.transfer({
                fromPubkey: walletPublicKey,
                toPubkey: new PublicKey(recipientAddress),
                lamports: LAMPORTS_PER_SOL * amount || 0,
              })
            );

            this.markAsSending({
              transactionId,
              date: new Date(Date.now()),
              processing: true,
              amount,
              logo: token?.logoURI ? token.logoURI : '',
              symbol: token?.symbol ? token.symbol : '',
            });

            return this.walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                tapResponse(
                  (signature) =>
                    this.markAsConfirming({
                      id: transactionId,
                      changes: { signature },
                    }),
                  (error) => this.logError(error)
                ),
                concatMap((signature) =>
                  from(
                    defer(() => connection.confirmTransaction(signature))
                  ).pipe(
                    tapResponse(
                      () => this.markAsConfirmed(transactionId),
                      (error) => this.logError(error)
                    )
                  )
                )
              );
          }
        )
      );
    }
  );

  readonly sendSplTransfer = this.effect(
    (
      splTransferConfig$: Observable<{
        amount: number;
        emitterAddress: string;
        recipientAddress: string;
        mintAddress: string;
        decimals: number;
      }>
    ) => {
      return splTransferConfig$.pipe(
        withLatestFrom(
          this.connectionStore.connection$.pipe(isNotNull),
          this.walletStore.publicKey$.pipe(isNotNull),
          this.networksStore.tokens$
        ),
        concatMap(
          ([
            { amount, emitterAddress, mintAddress, recipientAddress, decimals },
            connection,
            walletPublicKey,
            tokens,
          ]) => {
            const token = tokens.get(mintAddress);
            const transactionId = uuid();
            const transaction = new Transaction().add(
              Token.createTransferCheckedInstruction(
                TOKEN_PROGRAM_ID,
                new PublicKey(emitterAddress),
                new PublicKey(mintAddress),
                new PublicKey(recipientAddress),
                walletPublicKey,
                [],
                Math.round(amount * 10 ** decimals),
                decimals
              )
            );

            this.markAsSending({
              transactionId,
              date: new Date(Date.now()),
              processing: true,
              amount,
              logo: token?.logoURI ? token.logoURI : '',
              symbol: token?.symbol ? token.symbol : '',
            });

            return this.walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                tapResponse(
                  (signature) =>
                    this.markAsConfirming({
                      id: transactionId,
                      changes: { signature },
                    }),
                  (error) => this.logError(error)
                ),
                concatMap((signature) =>
                  from(
                    defer(() => connection.confirmTransaction(signature))
                  ).pipe(
                    tapResponse(
                      () => this.markAsConfirmed(transactionId),
                      (error) => this.logError(error)
                    )
                  )
                )
              );
          }
        )
      );
    }
  );

  private logError(error: unknown) {
    console.error(error);
  }
}
