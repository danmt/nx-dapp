import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { fromAccountChangeEvent } from '@nx-dapp/solana-dapp/account/utils/from-account-change';
import { TokenAccountParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Connection } from '@solana/web3.js';
import { combineLatest, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const observeTokenAccounts =
  (connection: Connection) => (source: Observable<TokenAccount[]>) =>
    source.pipe(
      switchMap((tokenAccounts) =>
        combineLatest(
          tokenAccounts.map((tokenAccount) =>
            fromAccountChangeEvent(connection, tokenAccount, (account) =>
              TokenAccountParser(tokenAccount.pubkey, account)
            )
          )
        )
      )
    );
