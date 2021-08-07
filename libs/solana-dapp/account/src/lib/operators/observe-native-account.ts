import {
  fromAccountChangeEvent,
  getNativeAccount,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account';
import { Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const observeNativeAccount =
  (connection: Connection) => (source: Observable<TokenAccount>) =>
    source.pipe(
      switchMap((nativeAccount) =>
        fromAccountChangeEvent(connection, nativeAccount, () =>
          getNativeAccount(connection, nativeAccount.pubkey)
        )
      )
    );
