import {
  fromAccountChangeEvent,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account';
import { Connection } from '@solana/web3.js';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { TokenAccountParser } from '../utils';

export const observeTokenAccounts =
  (connection: Connection) => (source: Observable<TokenAccount[]>) =>
    source.pipe(
      switchMap((tokenAccounts) => {
        if (tokenAccounts.length === 0) {
          return of([]);
        }

        return combineLatest(
          tokenAccounts.map((tokenAccount) =>
            fromAccountChangeEvent(connection, tokenAccount, (account) =>
              TokenAccountParser(tokenAccount.pubkey, account)
            )
          )
        );
      })
    );
