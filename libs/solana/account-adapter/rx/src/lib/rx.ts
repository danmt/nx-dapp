import { Connection, PublicKey } from '@solana/web3.js';
import {
  distinctUntilChanged
} from 'rxjs/operators';

import {
  InitAction,
  LoadConnectionAction,
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
