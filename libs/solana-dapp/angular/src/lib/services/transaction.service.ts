import { Injectable, OnDestroy } from '@angular/core';
import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { ofType } from '@nx-dapp/shared/operators/of-type';
import { Transaction } from '@nx-dapp/solana-dapp/wallet';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction as Web3Transaction,
} from '@solana/web3.js';
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
  map,
  observeOn,
  scan,
  shareReplay,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { SolanaDappConnectionService, SolanaDappWalletService } from '.';

interface Action {
  type: string;
  payload?: unknown;
}

enum TransactionStatus {
  PendingSign = 'PendingSign',
  Cancelled = 'Cancelled',
  PendingSend = 'PendingSend',
  PendingConfirmation = 'PendingConfirmation',
  Confirmed = 'Confirmed',
}

export interface ExtendedTransaction extends Transaction {
  status: TransactionStatus;
  txId?: string;
}

export interface TransactionResponse {
  id: string;
  txId: string;
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
            status: TransactionStatus.PendingSign,
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
            ? { ...transaction, status: TransactionStatus.PendingSend }
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
                status: TransactionStatus.PendingConfirmation,
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
            ? { ...transaction, status: TransactionStatus.Confirmed }
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
  onTransactionConfirmed$ = this.actions$.pipe(
    ofType<Action>('transactionConfirmed'),
    map(({ payload }) => (payload as TransactionResponse).txId)
  );

  private transactionSigned$ = this.walletService.onTransactionSigned$.pipe(
    map((transaction) => ({
      type: 'transactionSigned',
      payload: transaction,
    }))
  );

  private transactionSent$ = this.actions$.pipe(
    ofType<Action>('transactionSigned'),
    concatMap((transaction) =>
      this.connectionService
        .sendRawTransaction(
          (transaction.payload as Transaction).data.serialize()
        )
        .pipe(
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
    private walletService: SolanaDappWalletService
  ) {
    this.runEffects([
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
      this.connectionService.getRecentBlockhash(),
      this.walletService.publicKey$.pipe(isNotNull),
    ]).pipe(
      map(([{ blockhash }, fromPubkey]) => ({
        id: uuid(),
        data: new Web3Transaction({
          recentBlockhash: blockhash,
          feePayer: fromPubkey,
        }).add(
          SystemProgram.transfer({
            fromPubkey: fromPubkey,
            toPubkey: new PublicKey(recipientAddress),
            lamports: LAMPORTS_PER_SOL * amount || 0,
          })
        ),
      })),
      tap((transaction) => {
        this.walletService.signTransaction(transaction);
        this._dispatcher.next({
          type: 'transactionCreated',
          payload: transaction,
        });
      })
    );
  }
}
