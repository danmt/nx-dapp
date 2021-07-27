import { Wallet, WalletName } from '@nx-dapp/shared/wallet-adapter/base';
import {
  BehaviorSubject,
  combineLatest,
  defer,
  from,
  merge,
  Subject,
  throwError,
} from 'rxjs';
import {
  concatMap,
  map,
  mapTo,
  scan,
  shareReplay,
  take,
  tap,
} from 'rxjs/operators';

import {
  Action,
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

export class WalletService {
  private readonly _dispatcher = new BehaviorSubject<Action>(new InitAction());
  private readonly _connecting = new Subject<boolean>();
  private readonly _disconnecting = new Subject<boolean>();
  state$ = this._dispatcher.pipe(
    scan(reducer, walletInitialState),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  connecting$ = this._connecting.asObservable();
  disconnecting$ = this._disconnecting.asObservable();
  ready$ = this.state$.pipe(map(({ ready }) => ready));
  connected$ = this.state$.pipe(map(({ connected }) => connected));
  walletName$ = this.state$.pipe(map(({ selectedWallet }) => selectedWallet));
  wallets$ = this.state$.pipe(map(({ wallets }) => wallets));
  wallet$ = combineLatest([this.walletName$, this.wallets$]).pipe(
    map(([walletName, wallets]) =>
      wallets.find((wallet) => wallet.name === walletName)
    )
  );
  adapter$ = this.state$.pipe(map(({ adapter }) => adapter));
  onReady$ = this.adapter$.pipe(fromAdapterEvent('ready'));
  onConnect$ = this.adapter$.pipe(fromAdapterEvent('connect'));
  onDisconnect$ = this.adapter$.pipe(fromAdapterEvent('disconnect'));
  onError$ = this.adapter$.pipe(fromAdapterEvent('error'));

  constructor(wallets: Wallet[]) {
    this.loadWallets(wallets);

    merge(
      this.onReady$.pipe(mapTo(new ReadyAction())),
      this.onConnect$.pipe(mapTo(new ConnectAction())),
      this.onDisconnect$.pipe(mapTo(new DisconnectAction())),
      this.connecting$.pipe(
        map((connecting) => new ConnectingAction(connecting))
      ),
      this.disconnecting$.pipe(
        map((disconnecting) => new DisconnectingAction(disconnecting))
      )
    ).subscribe((action: Action) => this._dispatcher.next(action));
  }

  loadWallets(wallets: Wallet[]) {
    this._dispatcher.next(new LoadWalletsAction(wallets));
  }

  setWalletName(walletName: WalletName) {
    this._dispatcher.next(new SelectWalletAction(walletName));
  }

  private handleConnect({
    ready,
    connected,
    connecting,
    wallet,
    adapter,
  }: WalletState) {
    if (!ready) {
      return throwError('Wallet not ready');
    } else if (connected) {
      return throwError('Wallet already connected');
    } else if (connecting) {
      return throwError('Wallet already connecting');
    } else if (!wallet) {
      return throwError('Wallet not selected');
    } else if (!adapter) {
      return throwError('Wallet adapter not selected');
    } else {
      return from(defer(() => adapter.connect()));
    }
  }

  private handleDisconnect({
    connected,
    disconnecting,
    wallet,
    adapter,
  }: WalletState) {
    if (!connected) {
      return throwError('Wallet already disconnected');
    } else if (disconnecting) {
      return throwError('Wallet already disconnecting');
    } else if (!wallet) {
      return throwError('Wallet not selected');
    } else if (!adapter) {
      return throwError('Wallet adapter not selected');
    } else {
      return from(defer(() => adapter.disconnect()));
    }
  }

  connect() {
    return this.state$.pipe(
      take(1),
      tap(() => this._connecting.next(true)),
      concatMap(this.handleConnect),
      tap(() => this._connecting.next(false))
    );
  }

  disconnect() {
    return this.state$.pipe(
      take(1),
      tap(() => this._disconnecting.next(true)),
      concatMap(this.handleDisconnect),
      tap(() => this._disconnecting.next(false))
    );
  }
}
