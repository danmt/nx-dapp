import { Injectable, OnDestroy } from '@angular/core';
import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { ofType } from '@nx-dapp/shared/operators/of-type';
import { sendTransaction } from '@nx-dapp/solana-dapp/connection';
import { getTransferTransaction } from '@nx-dapp/solana-dapp/transaction';
import { Transaction } from '@nx-dapp/solana-dapp/wallet';
import { Connection } from '@solana/web3.js';
import {
  asyncScheduler,
  BehaviorSubject,
  combineLatest,
  merge,
  Observable,
  Subject,
} from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  first,
  map,
  mapTo,
  observeOn,
  scan,
  shareReplay,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import {
  SolanaDappConnectionService,
  SolanaDappNetworkService,
  SolanaDappWalletService,
} from '.';

interface Action {
  type: string;
  payload?: unknown;
}

export interface ExtendedTransaction extends Transaction {
  status: string;
  txId?: string;
}

interface TransactionState {
  transactions: ExtendedTransaction[];
  isProcessing: boolean;

  inProcess: number;
}

const transactionInitialState: TransactionState = {
  transactions: [],
  isProcessing: false,
  inProcess: 0,
};

const reducer = (state: TransactionState, action: Action) => {
  switch (action.type) {
    case 'transactionCreated':
      return {
        ...state,
        transactions: [
          ...state.transactions,
          {
            ...(action.payload as Transaction),
            status: 'Pending Sign',
          },
        ],
        isProcessing: true,
        inProcess: state.inProcess + 1,
      };
    case 'transactionSigned':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === (action.payload as Transaction).id
            ? { ...transaction, status: 'Pending Send' }
            : transaction
        ),
      };
    case 'transactionSent':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === (action.payload as TransactionResponse).id
            ? {
                ...transaction,
                status: 'Pending Confirmation',
                txId: (action.payload as TransactionResponse).txId,
              }
            : transaction
        ),
      };
    case 'transactionConfirmed':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === (action.payload as Transaction).id
            ? { ...transaction, status: 'Confirmed' }
            : transaction
        ),
        inProcess: state.inProcess - 1,
        isProcessing: state.inProcess - 1 > 0,
      };
    default:
      return state;
  }
};

@Injectable()
export class SolanaDappTransactionService implements OnDestroy {
  private readonly _destroy = new Subject();
  destroy$ = this._destroy.asObservable();
  private readonly _dispatcher = new BehaviorSubject<Action>({
    type: 'init',
  });
  actions$ = this._dispatcher.asObservable();
  state$ = this._dispatcher.pipe(
    scan(reducer, transactionInitialState),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  connection$ = this.networkService.network$.pipe(
    map(({ url }) => new Connection(url, 'recent')),
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
    map(({ payload }) => (payload as TransactionResponse).txId)
  );

  private transactionCreated$ = this.actions$.pipe(
    ofType<Action>('transactionCreated'),
    tap((transaction) =>
      this.walletService.signTransaction(transaction.payload as Transaction)
    ),
    mapTo({ type: 'noop' })
  );

  private transactionSigned$ = this.walletService.onTransactionSigned$.pipe(
    map((transaction) => ({
      type: 'transactionSigned',
      payload: transaction,
    }))
  );

  private transactionSent$ = this.actions$.pipe(
    ofType<Action>('transactionSigned'),
    withLatestFrom(this.connection$),
    concatMap(([transaction, connection]) =>
      sendTransaction(connection, transaction.payload as Transaction).pipe(
        map((txId) => ({
          type: 'transactionSent',
          payload: {
            id: (transaction.payload as Transaction).id,
            txId,
          },
        }))
      )
    )
  );

  private transactionConfirmed$ = this.actions$.pipe(
    ofType<Action>('transactionSent'),
    concatMap((transaction) =>
      this.connectionService
        .confirmTransaction((transaction.payload as TransactionResponse).txId)
        .pipe(
          map((txId) => ({
            type: 'transactionConfirmed',
            payload: {
              id: (transaction.payload as Transaction).id,
              txId,
            },
          }))
        )
    )
  );

  constructor(
    private connectionService: SolanaDappConnectionService,
    private networkService: SolanaDappNetworkService,
    private walletService: SolanaDappWalletService
  ) {
    this.runEffects([
      this.transactionCreated$,
      this.transactionSigned$,
      this.transactionSent$,
      this.transactionConfirmed$,
    ]);
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this.destroy$), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }

  transfer(recipientAddress: string, amount: number) {
    return combineLatest([
      this.connection$,
      this.walletService.walletAddress$.pipe(isNotNull),
    ]).pipe(
      first(),
      concatMap(([connection, walletAddress]) =>
        getTransferTransaction({
          connection,
          walletAddress,
          recipientAddress,
          amount,
        })
      ),
      tap((transaction) =>
        this._dispatcher.next({
          type: 'transactionCreated',
          payload: transaction,
        })
      )
    );
  }
}
