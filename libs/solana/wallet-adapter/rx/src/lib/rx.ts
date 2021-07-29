import {
  Wallet,
  WalletName,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletNotSelectedError,
} from '@nx-dapp/solana/wallet-adapter/base';
import { Transaction } from '@solana/web3.js';
import {
  BehaviorSubject,
  combineLatest,
  defer,
  from,
  merge,
  of,
  throwError,
} from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  scan,
  shareReplay,
  take,
  tap,
} from 'rxjs/operators';

import {
  ClearWalletAction,
  ConnectAction,
  ConnectingAction,
  DisconnectAction,
  DisconnectingAction,
  InitAction,
  LoadWalletsAction,
  ReadyAction,
  SelectWalletAction,
} from './actions';
import { fromAdapterEvent } from './operators';
import { reducer, walletInitialState, WalletState } from './state';
import { Action, IWalletService } from './types';

export class WalletService implements IWalletService {
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

  constructor(wallets: Wallet[]) {
    this.loadWallets(wallets);

    merge(this.onReady$, this.onConnect$, this.onDisconnect$).subscribe(
      (action: Action) => this._dispatcher.next(action)
    );
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
    this._dispatcher.next(new ClearWalletAction());

    this.state$
      .pipe(
        take(1),
        concatMap(({ wallet, connected }) =>
          wallet?.name === walletName && connected
            ? this.disconnect()
            : of(true)
        )
      )
      .subscribe(() =>
        this._dispatcher.next(new SelectWalletAction(walletName))
      );
  }

  connect() {
    return this.state$.pipe(
      take(1),
      filter(
        ({ connected, connecting, disconnecting }) =>
          !connected && !connecting && !disconnecting
      ),
      tap(() => this._dispatcher.next(new ConnectingAction(true))),
      concatMap(this.handleConnect),
      tap(() => this._dispatcher.next(new ConnectingAction(false)))
    );
  }

  disconnect() {
    return this.state$.pipe(
      take(1),
      filter(({ disconnecting }) => !disconnecting),
      tap(() => this._dispatcher.next(new DisconnectingAction(true))),
      concatMap(this.handleDisconnect),
      tap(() => this._dispatcher.next(new DisconnectingAction(false)))
    );
  }

  signTransaction(transaction: Transaction) {
    return this.state$.pipe(
      take(1),
      concatMap((state) => this.handleSignTransaction(transaction, state))
    );
  }

  signAllTransactions(transactions: Transaction[]) {
    return this.state$.pipe(
      take(1),
      concatMap((state) => this.handleSignAllTransactions(transactions, state))
    );
  }
}