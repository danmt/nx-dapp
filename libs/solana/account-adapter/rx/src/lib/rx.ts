import { Connection, PublicKey } from '@solana/web3.js';
import { BehaviorSubject } from 'rxjs';
import { scan, shareReplay } from 'rxjs/operators';

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
