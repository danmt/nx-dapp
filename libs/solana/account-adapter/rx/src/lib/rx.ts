import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { ofType } from '@nx-dapp/shared/operators/of-type';
import { TokenAccountParser } from '@nx-dapp/solana/account-adapter/base';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import {
  asyncScheduler,
  BehaviorSubject,
  combineLatest,
  defer,
  from,
  merge,
  Observable,
  Subject,
} from 'rxjs';
import {
  map,
  observeOn,
  scan,
  shareReplay,
  switchMap,
  takeUntil,
} from 'rxjs/operators';

import {
  InitAction,
  LoadConnectionAction,
  LoadNativeAccountAction,
  LoadTokenAccountsAction,
  LoadWalletConnectedAction,
  LoadWalletPublicKeyAction,
} from './actions';
import { accountInitialState, reducer } from './state';
import { Action, IAccountService } from './types';

export class AccountService implements IAccountService {
  private readonly _destroy = new Subject();
  private readonly _dispatcher = new BehaviorSubject<Action>(new InitAction());
  actions$ = this._dispatcher.asObservable();
  state$ = this._dispatcher.pipe(
    scan(reducer, accountInitialState),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );

  private loadNativeAccount$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(
      ofType<LoadWalletPublicKeyAction>('loadWalletPublicKey')
    ),
  ]).pipe(
    switchMap(([{ payload: connection }, { payload: walletPublicKey }]) =>
      from(defer(() => connection.getAccountInfo(walletPublicKey)))
    ),
    isNotNull,
    map((account) => new LoadNativeAccountAction(account))
  );

  private loadTokenAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(
      ofType<LoadWalletPublicKeyAction>('loadWalletPublicKey')
    ),
  ]).pipe(
    switchMap(([{ payload: connection }, { payload: walletPublicKey }]) =>
      from(
        defer(() =>
          connection.getTokenAccountsByOwner(walletPublicKey, {
            programId: TOKEN_PROGRAM_ID,
          })
        )
      ).pipe(
        map(
          (accounts) =>
            new LoadTokenAccountsAction({
              tokenAccounts: accounts.value
                .filter((info) => info.account.data.length > 0)
                .map((info) =>
                  TokenAccountParser(
                    new PublicKey(info.pubkey.toBase58()),
                    info.account
                  )
                ),
              walletPublicKey,
            })
        )
      )
    )
  );

  constructor() {
    this.runEffects([this.loadTokenAccounts$, this.loadNativeAccount$]);
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this._destroy), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }

  loadConnection(connection: Connection) {
    this._dispatcher.next(new LoadConnectionAction(connection));
  }

  loadWalletPublicKey(publicKey: PublicKey) {
    this._dispatcher.next(new LoadWalletPublicKeyAction(publicKey));
  }

  loadWalletConnected(publicKey: boolean) {
    this._dispatcher.next(new LoadWalletConnectedAction(publicKey));
  }

  changeAccount(account: AccountInfo<Buffer>) {
    this._dispatcher.next(new LoadNativeAccountAction(account));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
