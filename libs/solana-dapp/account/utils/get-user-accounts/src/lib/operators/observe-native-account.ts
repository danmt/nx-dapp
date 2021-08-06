import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { fromAccountChangeEvent } from '@nx-dapp/solana-dapp/account/utils/generics';
import { Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { getNativeAccount } from '../get-native-account';

export const observeNativeAccount =
  (connection: Connection) => (source: Observable<TokenAccount>) =>
    source.pipe(
      switchMap((nativeAccount) =>
        fromAccountChangeEvent(connection, nativeAccount, () =>
          getNativeAccount(connection, nativeAccount.pubkey)
        )
      )
    );
