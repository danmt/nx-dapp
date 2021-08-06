import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/types';
import { AccountInfo, Connection } from '@solana/web3.js';
import { fromEventPattern, isObservable, Observable, of } from 'rxjs';
import { concatMap, startWith } from 'rxjs/operators';

export const fromAccountChangeEvent = <T extends ParsedAccountBase>(
  connection: Connection,
  account: T,
  project: (account: AccountInfo<Buffer>) => T | Observable<T>
): Observable<T> =>
  fromEventPattern<[AccountInfo<Buffer>, { slot: number }]>(
    (addHandler) => connection.onAccountChange(account.pubkey, addHandler),
    (removeHandler, id) =>
      connection.removeAccountChangeListener(id).then(removeHandler)
  ).pipe(
    concatMap(([data]) => {
      const projected = project(data);

      return isObservable(projected) ? projected : of(projected);
    }),
    startWith(account)
  );
