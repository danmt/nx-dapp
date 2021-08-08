import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { ofType } from '@nx-dapp/shared/operators/of-type';
import { Network } from '@nx-dapp/solana-dapp/network';
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
  observeOn,
  scan,
  shareReplay,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';

import {
  ActionTypes,
  ConnectWalletAction,
  DisconnectWalletAction,
  InitAction,
  LoadWalletsAction,
  NetworkChangedAction,
  reducer,
  SelectWalletAction,
  SetNetworkAction,
  SignTransactionAction,
  SignTransactionsAction,
  TransactionSignedAction,
  TransactionsSignedAction,
  WalletConnectedAction,
  WalletDisconnectedAction,
  walletInitialState,
  WalletSelectedAction,
  WalletState,
} from './state';
import { IWalletClient, Wallet, WalletName } from './types';
import {
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletNotSelectedError,
} from './utils';

export class WalletClient implements IWalletClient {
  private readonly _destroy = new Subject();
  private readonly _dispatcher = new BehaviorSubject<ActionTypes>(
    new InitAction()
  );
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

  private walletConnected$ = this.actions$.pipe(
    ofType<ConnectWalletAction>('connectWallet'),
    withLatestFrom(this.state$),
    filter(([, { connected, disconnecting }]) => !connected && !disconnecting),
    exhaustMap(([, state]) =>
      this.handleConnect(state).pipe(map(() => new WalletConnectedAction()))
    )
  );

  private walletDisconnected$ = this.actions$.pipe(
    ofType<ConnectWalletAction>('disconnectWallet'),
    withLatestFrom(this.state$),
    filter(([, { connected, connecting }]) => connected && !connecting),
    exhaustMap(([, state]) =>
      this.handleDisconnect(state).pipe(
        map(() => new WalletDisconnectedAction())
      )
    )
  );

  private walletSelected$ = this.actions$.pipe(
    ofType<SelectWalletAction>('selectWallet'),
    withLatestFrom(this.state$),
    filter(
      ([{ payload: walletName }, { wallet }]) => walletName !== wallet?.name
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
        map((wallet) => new WalletSelectedAction(wallet))
      )
    )
  );

  private transactionSigned$ = this.actions$.pipe(
    ofType<SignTransactionAction>('signTransaction'),
    withLatestFrom(this.state$),
    filter(([, { signing }]) => signing),
    exhaustMap(([{ payload: transaction }, state]) =>
      this.handleSignTransaction(transaction, state).pipe(
        map(() => new TransactionSignedAction(transaction))
      )
    )
  );

  private transactionsSigned$ = this.actions$.pipe(
    ofType<SignTransactionsAction>('signTransactions'),
    withLatestFrom(this.state$),
    filter(([, { signing }]) => signing),
    exhaustMap(([{ payload: transactions }, state]) =>
      this.handleSignAllTransactions(transactions, state).pipe(
        map(() => new TransactionsSignedAction(transactions))
      )
    )
  );

  networkChanged$ = this.actions$.pipe(
    ofType<SetNetworkAction>('setNetwork'),
    withLatestFrom(this.state$),
    filter(([, { connected }]) => connected),
    exhaustMap(([, state]) =>
      this.handleDisconnect(state).pipe(map(() => new NetworkChangedAction()))
    )
  );

  constructor(wallets: Wallet[], defaultWallet: WalletName) {
    this.runEffects([
      this.walletConnected$,
      this.walletDisconnected$,
      this.walletSelected$,
      this.transactionSigned$,
      this.transactionsSigned$,
      this.networkChanged$,
    ]);

    setTimeout(() => {
      this.loadWallets(wallets);
      this.selectWallet(defaultWallet);
    });
  }

  private runEffects(effects: Observable<ActionTypes>[]) {
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

  selectWallet(walletName: WalletName) {
    this._dispatcher.next(new SelectWalletAction(walletName));
  }

  setNetwork(network: Network) {
    this._dispatcher.next(new SetNetworkAction(network));
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
