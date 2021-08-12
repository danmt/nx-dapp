import { ofType } from '@nx-dapp/shared/utils/operators';
import {
  confirmTransaction,
  sendTransaction,
} from '@nx-dapp/solana-dapp/connection';
import { Network } from '@nx-dapp/solana-dapp/network';
import {
  CreateTransactionPayload,
  getTransferTransaction,
  Transaction,
  TransactionResponse,
} from '@nx-dapp/solana-dapp/transaction';
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

import { Action, reducer, transactionInitialState } from './state';

export class TransactionClient {
  private readonly _destroy = new Subject();
  destroy$ = this._destroy.asObservable();
  private readonly _dispatcher = new BehaviorSubject<Action>({
    type: 'init',
  });
  actions$ = this._dispatcher.asObservable();
  private readonly connection$ = this.actions$.pipe(
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
  onTransactionCreated$ = this.actions$.pipe(
    ofType<Action>('transactionCreated'),
    map(({ payload }) => payload as Transaction)
  );
  onTransactionConfirmed$ = this.actions$.pipe(
    ofType<Action>('transactionConfirmed'),
    map(({ payload }) => payload as TransactionResponse)
  );
  onTransactionCancelled$ = this.actions$.pipe(
    ofType<Action>('cancelTransaction'),
    map(({ payload }) => payload as string)
  );

  private transactionCreated$ = this.actions$.pipe(
    ofType<Action>('createTransaction'),
    withLatestFrom(this.connection$, this.walletAddress$),
    concatMap(([{ payload: createTransaction }, connection, walletAddress]) =>
      getTransferTransaction({
        connection,
        walletAddress,
        recipientAddress: (createTransaction as CreateTransactionPayload)
          .recipientAddress,
        amount: (createTransaction as CreateTransactionPayload).amount,
      }).pipe(
        map((transaction) => ({
          type: 'transactionCreated',
          payload: transaction,
        }))
      )
    )
  );

  private confirmTransaction$ = this.actions$.pipe(
    ofType<Action>('sendTransaction'),
    withLatestFrom(this.connection$),
    concatMap(([transaction, connection]) =>
      sendTransaction(connection, transaction.payload as Transaction).pipe(
        map((txId) => ({
          type: 'confirmTransaction',
          payload: {
            id: (transaction.payload as Transaction).id,
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
          payload: (transaction.payload as Transaction).id,
        }))
      )
    )
  );

  constructor() {
    this.runEffects([
      this.confirmTransaction$,
      this.transactionConfirmed$,
      this.transactionCreated$,
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

  sendTransaction(transaction: Transaction) {
    this._dispatcher.next({
      type: 'sendTransaction',
      payload: transaction,
    });
  }

  createTransaction(recipientAddress: string, amount: number) {
    this._dispatcher.next({
      type: 'createTransaction',
      payload: {
        recipientAddress,
        amount,
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
