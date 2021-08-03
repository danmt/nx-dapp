import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { ofType } from '@nx-dapp/shared/operators/of-type';
import { getNativeAccount } from '@nx-dapp/solana-dapp/account/utils/get-native-account';
import { getTokenAccounts } from '@nx-dapp/solana-dapp/account/utils/get-token-accounts';
import { TokenAccountParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Network } from '@nx-dapp/solana-dapp/connection/types';
import { Wallet, WalletName } from '@nx-dapp/solana-dapp/wallet/types';
import {
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletNotSelectedError,
} from '@nx-dapp/solana-dapp/wallet/utils/errors';
import {
  AccountInfo,
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
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
  ChangeAccountAction,
  ConnectAction,
  ConnectWalletAction,
  DisconnectAction,
  DisconnectWalletAction,
  InitAction,
  LoadConnectionAction,
  LoadNativeAccountAction,
  LoadNetworkAction,
  LoadTokenAccountsAction,
  LoadWalletsAction,
  ReadyAction,
  ResetAction,
  SelectWalletAction,
  SignTransactionAction,
  SignTransactionsAction,
  TransactionSignedAction,
  TransactionsSignedAction,
  WalletConnectedAction,
  WalletDisconnectedAction,
  WalletNetworkChangedAction,
  WalletSelectedAction,
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
  tokenAccounts$ = this.state$.pipe(
    map(({ tokenAccounts }) => tokenAccounts),
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

  private walletNetworkChanged$ = this.actions$.pipe(
    ofType<LoadNetworkAction>('loadNetwork'),
    withLatestFrom(this.state$),
    filter(([, { connected, connecting }]) => connected && !connecting),
    exhaustMap(([, state]) =>
      this.handleDisconnect(state).pipe(
        map(() => new WalletNetworkChangedAction())
      )
    )
  );

  private loadNativeAccount$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(ofType<WalletConnectedAction>('walletConnected')),
  ]).pipe(
    withLatestFrom(this.state$),
    filter(([, { publicKey }]) => publicKey !== null),
    switchMap(([[{ payload: connection }], { publicKey }]) =>
      getNativeAccount(connection, publicKey as PublicKey).pipe(
        map((account) => new LoadNativeAccountAction(account))
      )
    )
  );

  private accountChanged$ = this.actions$.pipe(
    ofType<ChangeAccountAction>('changeAccount'),
    withLatestFrom(this.state$),
    filter(([, { publicKey }]) => publicKey !== null),
    map(
      ([{ payload: account }, { publicKey }]) =>
        new LoadNativeAccountAction(
          TokenAccountParser(publicKey as PublicKey, account)
        )
    )
  );

  private loadTokenAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(ofType<WalletConnectedAction>('walletConnected')),
  ]).pipe(
    withLatestFrom(this.state$),
    filter(([, { publicKey }]) => publicKey !== null),
    switchMap(([[{ payload: connection }], { publicKey }]) =>
      getTokenAccounts(connection, publicKey as PublicKey).pipe(
        map((tokenAccounts) => new LoadTokenAccountsAction(tokenAccounts))
      )
    )
  );

  private reset$ = this.actions$.pipe(
    ofType<WalletDisconnectedAction>('walletDisconnected'),
    map(() => new ResetAction())
  );

  constructor(wallets: Wallet[], defaultWallet: WalletName) {
    this.runEffects([
      this.onReady$,
      this.onConnect$,
      this.onDisconnect$,
      this.walletConnected$,
      this.walletDisconnected$,
      this.walletSelected$,
      this.transactionSigned$,
      this.transactionsSigned$,
      this.walletNetworkChanged$,
      this.loadTokenAccounts$,
      this.loadNativeAccount$,
      this.accountChanged$,
      this.reset$,
    ]);

    setTimeout(() => {
      this.loadWallets(wallets);
      this.selectWallet(defaultWallet);
    });
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

  selectWallet(walletName: WalletName) {
    this._dispatcher.next(new SelectWalletAction(walletName));
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

  loadNetwork(network: Network) {
    this._dispatcher.next(new LoadNetworkAction(network));
  }

  changeAccount(account: AccountInfo<Buffer>) {
    this._dispatcher.next(new ChangeAccountAction(account));
  }

  loadConnection(connection: Connection) {
    this._dispatcher.next(new LoadConnectionAction(connection));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
