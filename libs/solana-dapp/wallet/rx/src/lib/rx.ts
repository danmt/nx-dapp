import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { ofType } from '@nx-dapp/shared/operators/of-type';
import {
  Wallet,
  WalletName,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletNotSelectedError,
} from '@nx-dapp/solana-dapp/wallet/base';
import { Transaction } from '@solana/web3.js';
import {
  asyncScheduler,
  BehaviorSubject,
  combineLatest,
  defer,
  from,
  merge,
  Observable,
  of,
  Subject,
  throwError,
} from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  mapTo,
  observeOn,
  scan,
  shareReplay,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';

import {
  ChangeWalletAction,
  ConnectAction,
  ConnectWalletAction,
  DisconnectAction,
  DisconnectWalletAction,
  InitAction,
  LoadWalletsAction,
  ReadyAction,
  SignTransactionAction,
  SignTransactionsAction,
  TransactionSignedAction,
  TransactionsSignedAction,
  WalletChangedAction,
  WalletConnectedAction,
  WalletDisconnectedAction,
} from './actions';
import { fromAdapterEvent } from './operators';
import { reducer, walletInitialState } from './state';
import { Action, IWalletService, WalletState } from './types';

export class WalletService implements IWalletService {
  private readonly _destroy = new Subject();
  private readonly _dispatcher = new BehaviorSubject<Action>(new InitAction());
  actions$ = this._dispatcher.asObservable();
  state$ = this._dispatcher.pipe(
    scan(reducer, walletInitialState),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  ready$ = this.state$.pipe(
    map(({ ready }) => ready),
    distinctUntilChanged()
  );
  connected$ = this.state$.pipe(
    map(({ connected }) => connected),
    distinctUntilChanged()
  );
  walletName$ = this.state$.pipe(
    map(({ selectedWallet }) => selectedWallet || null),
    distinctUntilChanged()
  );
  wallets$ = this.state$.pipe(
    map(({ wallets }) => wallets),
    distinctUntilChanged()
  );
  wallet$ = combineLatest([this.walletName$, this.wallets$]).pipe(
    map(
      ([walletName, wallets]) =>
        wallets.find((wallet) => wallet.name === walletName) || null
    ),
    distinctUntilChanged()
  );
  adapter$ = this.state$.pipe(
    map(({ adapter }) => adapter),
    distinctUntilChanged()
  );
  publicKey$ = this.state$.pipe(
    map(({ publicKey }) => publicKey),
    distinctUntilChanged()
  );
  onReady$ = this.adapter$
    .pipe(fromAdapterEvent('ready'))
    .pipe(mapTo(new ReadyAction()));
  onConnect$ = this.adapter$
    .pipe(fromAdapterEvent('connect'))
    .pipe(mapTo(new ConnectAction()));
  onDisconnect$ = this.adapter$
    .pipe(fromAdapterEvent('disconnect'))
    .pipe(mapTo(new DisconnectAction()));
  onError$ = this.adapter$.pipe(fromAdapterEvent('error'));

  private connectWallet$ = this.actions$.pipe(
    ofType<ConnectWalletAction>('connectWallet'),
    withLatestFrom(this.state$),
    filter(([, { connected, disconnecting }]) => !connected && !disconnecting),
    exhaustMap(([, state]) =>
      this.handleConnect(state).pipe(map(() => new WalletConnectedAction()))
    )
  );

  private disconnectWallet$ = this.actions$.pipe(
    ofType<ConnectWalletAction>('disconnectWallet'),
    withLatestFrom(this.state$),
    filter(([, { connected, connecting }]) => connected && !connecting),
    exhaustMap(([, state]) =>
      this.handleDisconnect(state).pipe(
        map(() => new WalletDisconnectedAction())
      )
    )
  );

  private changeWallet$ = this.actions$.pipe(
    ofType<ChangeWalletAction>('changeWallet'),
    withLatestFrom(this.state$),
    filter(
      ([{ payload: walletName }, { wallet }]) => walletName === wallet?.name
    ),
    switchMap(([action, state]) =>
      of(action).pipe(
        concatMap(() =>
          !state.connected ? of(null) : this.handleDisconnect(state)
        ),
        map(
          () =>
            state.wallets.find((wallet) => wallet.name === action.payload) ||
            null
        ),
        isNotNull,
        map((wallet) => new WalletChangedAction(wallet))
      )
    )
  );

  private signTransaction$ = this.actions$.pipe(
    ofType<SignTransactionAction>('signTransaction'),
    withLatestFrom(this.state$),
    filter(([, { signing }]) => signing),
    exhaustMap(([{ payload: transaction }, state]) =>
      this.handleSignTransaction(transaction, state).pipe(
        map(() => new TransactionSignedAction(transaction))
      )
    )
  );

  private signTransactions$ = this.actions$.pipe(
    ofType<SignTransactionsAction>('signTransactions'),
    withLatestFrom(this.state$),
    filter(([, { signing }]) => signing),
    exhaustMap(([{ payload: transactions }, state]) =>
      this.handleSignAllTransactions(transactions, state).pipe(
        map(() => new TransactionsSignedAction(transactions))
      )
    )
  );

  constructor(wallets: Wallet[]) {
    this.runEffects([
      this.onReady$,
      this.onConnect$,
      this.onDisconnect$,
      this.connectWallet$,
      this.disconnectWallet$,
      this.changeWallet$,
      this.signTransaction$,
      this.signTransactions$,
    ]);

    this.loadWallets(wallets);
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this._destroy), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }

  private handleConnect({ ready, wallet, adapter }: WalletState) {
    if (!ready) {
      return throwError(new WalletNotReadyError());
    }
    if (!wallet || !adapter) {
      return throwError(new WalletNotSelectedError());
    }
    return from(defer(() => adapter.connect()));
  }

  private handleDisconnect({ connected, wallet, adapter }: WalletState) {
    if (!connected) {
      return throwError(new WalletNotConnectedError());
    }
    if (!wallet || !adapter) {
      return throwError(new WalletNotSelectedError());
    }
    return from(defer(() => adapter.disconnect()));
  }

  private handleSignTransaction(
    transaction: Transaction,
    { adapter, connected, wallet }: WalletState
  ) {
    if (!connected) {
      return throwError(new WalletNotConnectedError());
    }
    if (!adapter || !wallet) {
      return throwError(new WalletNotSelectedError());
    }
    return from(defer(() => adapter.signTransaction(transaction)));
  }

  private handleSignAllTransactions(
    transactions: Transaction[],
    { adapter, connected, wallet }: WalletState
  ) {
    if (!connected) {
      return throwError(new WalletNotConnectedError());
    }
    if (!adapter || !wallet) {
      return throwError(new WalletNotSelectedError());
    }
    return from(defer(() => adapter.signAllTransactions(transactions)));
  }

  loadWallets(wallets: Wallet[]) {
    this._dispatcher.next(new LoadWalletsAction(wallets));
  }

  changeWallet(walletName: WalletName) {
    this._dispatcher.next(new ChangeWalletAction(walletName));
  }

  connect() {
    this._dispatcher.next(new ConnectWalletAction());
  }

  disconnect() {
    this._dispatcher.next(new DisconnectWalletAction());
  }

  signTransaction(transaction: Transaction) {
    this._dispatcher.next(new SignTransactionAction(transaction));
  }

  signAllTransactions(transactions: Transaction[]) {
    this._dispatcher.next(new SignTransactionsAction(transactions));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
