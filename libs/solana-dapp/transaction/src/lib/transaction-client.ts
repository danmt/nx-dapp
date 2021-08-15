import { ofType } from '@nx-dapp/shared/utils/operators';
import {
  confirmTransaction,
  sendTransaction,
} from '@nx-dapp/solana-dapp/connection';
import {
  CreateNativeTransferPayload,
  CreateSplTransferPayload,
  Network,
  TransactionPayload,
  TransactionResponse,
} from '@nx-dapp/solana-dapp/utils/types';
import { Connection } from '@solana/web3.js';
import {
  asyncScheduler,
  BehaviorSubject,
  merge,
  Observable,
  Subject,
} from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  map,
  observeOn,
  scan,
  shareReplay,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { getNativeTransferTransaction } from './get-native-transfer-transaction';
import { getSplTransferTransaction } from './get-spl-transfer-transaction';
import { Action, reducer, transactionInitialState } from './state';

export class TransactionClient {
  private readonly _destroy = new Subject();
  destroy$ = this._destroy.asObservable();
  private readonly _dispatcher = new BehaviorSubject<Action>({
    type: 'init',
  });
  actions$ = this._dispatcher.asObservable();
  connection$ = this.actions$.pipe(
    ofType<Action>('setNetwork'),
    map((action) => new Connection((action.payload as Network).url, 'recent')),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  private walletAddress$ = this.actions$.pipe(
    ofType<Action>('setWalletAddress'),
    map((action) => action.payload as string)
  );
  state$ = this._dispatcher.pipe(
    scan(reducer, transactionInitialState),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  transactions$ = this.state$.pipe(
    map(({ transactions }) => transactions),
    distinctUntilChanged()
  );
  isProcessing$ = this.state$.pipe(
    map(({ isProcessing }) => isProcessing),
    distinctUntilChanged()
  );
  inProcess$ = this.state$.pipe(
    map(({ inProcess }) => inProcess),
    distinctUntilChanged()
  );
  onNativeTransferCreated$ = this.actions$.pipe(
    ofType<Action>('nativeTransferCreated'),
    map(({ payload }) => payload as TransactionPayload)
  );
  onSplTransferCreated$ = this.actions$.pipe(
    ofType<Action>('splTransferCreated'),
    map(({ payload }) => payload as TransactionPayload)
  );
  onTransactionCreated$ = merge(
    this.onNativeTransferCreated$,
    this.onSplTransferCreated$
  );
  onTransactionConfirmed$ = this.actions$.pipe(
    ofType<Action>('transactionConfirmed'),
    map(({ payload }) => payload as TransactionResponse)
  );
  onTransactionCancelled$ = this.actions$.pipe(
    ofType<Action>('cancelTransaction'),
    map(({ payload }) => payload as string)
  );

  private nativeTransferCreated$ = this.actions$.pipe(
    ofType<Action>('createNativeTransfer'),
    withLatestFrom(this.connection$, this.walletAddress$),
    concatMap(
      ([{ payload: createNativeTransfer }, connection, walletAddress]) =>
        getNativeTransferTransaction({
          connection,
          walletAddress,
          recipientAddress: (
            createNativeTransfer as CreateNativeTransferPayload
          ).recipientAddress,
          amount: (createNativeTransfer as CreateNativeTransferPayload).amount,
        }).pipe(
          map((transaction) => ({
            type: 'nativeTransferCreated',
            payload: {
              id: (createNativeTransfer as CreateNativeTransferPayload).id,
              data: transaction,
            },
          }))
        )
    )
  );

  private splTransferCreated$ = this.actions$.pipe(
    ofType<Action>('createSplTransfer'),
    withLatestFrom(this.connection$, this.walletAddress$),
    concatMap(([{ payload: createSplTransfer }, connection, walletAddress]) =>
      getSplTransferTransaction({
        connection,
        walletAddress,
        mintAddress: (createSplTransfer as CreateSplTransferPayload)
          .mintAddress,
        decimals: (createSplTransfer as CreateSplTransferPayload).decimals,
        amount: (createSplTransfer as CreateSplTransferPayload).amount,
        emitterAddress: (createSplTransfer as CreateSplTransferPayload)
          .emitterAddress,
        recipientAddress: (createSplTransfer as CreateSplTransferPayload)
          .recipientAddress,
      }).pipe(
        map((transaction) => ({
          type: 'splTransferCreated',
          payload: {
            id: (createSplTransfer as CreateSplTransferPayload).id,
            data: transaction,
          },
        }))
      )
    )
  );

  private confirmTransaction$ = this.actions$.pipe(
    ofType<Action>('sendTransaction'),
    withLatestFrom(this.connection$),
    concatMap(([transaction, connection]) =>
      sendTransaction(
        connection,
        transaction.payload as TransactionPayload
      ).pipe(
        map((txId) => ({
          type: 'confirmTransaction',
          payload: {
            id: (transaction.payload as TransactionPayload).id,
            txId,
          },
        }))
      )
    )
  );

  private transactionConfirmed$ = this.actions$.pipe(
    ofType<Action>('confirmTransaction'),
    withLatestFrom(this.connection$),
    concatMap(([transaction, connection]) =>
      confirmTransaction(
        connection,
        (transaction.payload as TransactionResponse).txId
      ).pipe(
        map(() => ({
          type: 'transactionConfirmed',
          payload: (transaction.payload as TransactionPayload).id,
        }))
      )
    )
  );

  constructor() {
    this.runEffects([
      this.confirmTransaction$,
      this.transactionConfirmed$,
      this.nativeTransferCreated$,
      this.splTransferCreated$,
    ]);
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this.destroy$), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }

  setNetwork(network: Network) {
    this._dispatcher.next({ type: 'setNetwork', payload: network });
  }

  setWalletAddress(walletAddress: string) {
    this._dispatcher.next({ type: 'setWalletAddress', payload: walletAddress });
  }

  reset() {
    this._dispatcher.next({ type: 'reset' });
  }

  sendTransaction(transaction: TransactionPayload) {
    this._dispatcher.next({
      type: 'sendTransaction',
      payload: transaction,
    });
  }

  createNativeTransfer(recipientAddress: string, amount: number) {
    this._dispatcher.next({
      type: 'createNativeTransfer',
      payload: {
        id: uuid(),
        date: new Date(Date.now()),
        recipientAddress,
        amount,
      },
    });
  }

  createSplTransfer(
    emitterAddress: string,
    recipientAddress: string,
    mintAddress: string,
    amount: number,
    decimals: number
  ) {
    this._dispatcher.next({
      type: 'createSplTransfer',
      payload: {
        id: uuid(),
        date: new Date(Date.now()),
        emitterAddress,
        recipientAddress,
        mintAddress,
        amount: Math.round(amount * 10 ** decimals),
        decimals,
      },
    });
  }

  cancelTransaction(id: string) {
    this._dispatcher.next({
      type: 'cancelTransaction',
      payload: id,
    });
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
