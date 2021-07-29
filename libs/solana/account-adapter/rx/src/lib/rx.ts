import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { TokenAccountParser } from '@nx-dapp/solana/account-adapter/base';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { BehaviorSubject, combineLatest, defer, from } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  scan,
  shareReplay,
  switchMap,
} from 'rxjs/operators';

import {
  InitAction,
  LoadConnectionAction,
  LoadTokenAccountsAction,
  LoadWalletConnectedAction,
  LoadWalletPublicKeyAction,
} from './actions';
import { accountInitialState, reducer } from './state';
import { Action, IAccountService } from './types';

export class AccountService implements IAccountService {
  private readonly _dispatcher = new BehaviorSubject<Action>(new InitAction());
  actions$ = this._dispatcher.asObservable();
  state$ = this._dispatcher.pipe(
    scan(reducer, accountInitialState),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  connection$ = this.state$.pipe(
    map(({ connection }) => connection),
    distinctUntilChanged()
  );
  walletPublicKey$ = this.state$.pipe(
    map(({ walletPublicKey }) => walletPublicKey),
    distinctUntilChanged()
  );

  constructor() {
    combineLatest([
      this.connection$.pipe(isNotNull),
      this.walletPublicKey$.pipe(isNotNull),
    ])
      .pipe(
        switchMap(([connection, walletPublicKey]) =>
          from(
            defer(() =>
              connection.getTokenAccountsByOwner(walletPublicKey, {
                programId: TOKEN_PROGRAM_ID,
              })
            )
          ).pipe(
            map((accounts) =>
              accounts.value
                .filter((info) => info.account.data.length > 0)
                .map((info) =>
                  TokenAccountParser(
                    new PublicKey(info.pubkey.toBase58()),
                    info.account
                  )
                )
            )
          )
        )
      )
      .subscribe((tokenAccounts) =>
        this._dispatcher.next(new LoadTokenAccountsAction(tokenAccounts))
      );
  }

  loadConnection(connection: Connection) {
    this._dispatcher.next(new LoadConnectionAction(connection));
  }

  loadWalletPublicKey(publicKey: PublicKey | null) {
    this._dispatcher.next(new LoadWalletPublicKeyAction(publicKey));
  }

  loadWalletConnected(publicKey: boolean) {
    this._dispatcher.next(new LoadWalletConnectedAction(publicKey));
  }
}
