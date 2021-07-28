import { Connection, Keypair } from '@solana/web3.js';
import { fromEventPattern, Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

export const isNotNull = <T>(source: Observable<T | null>) =>
  source.pipe(filter((adapter: T | null): adapter is T => adapter !== null));

export const fromAccountChangeEvent = (source: Observable<Connection | null>) =>
  source.pipe(
    isNotNull,
    switchMap((connection) =>
      fromEventPattern(
        (addHandler) =>
          connection.onAccountChange(Keypair.generate().publicKey, addHandler),
        (removeHandler, id) =>
          connection.removeAccountChangeListener(id).then(removeHandler)
      )
    )
  );

export const fromSlotChangeEvent = (source: Observable<Connection | null>) =>
  source.pipe(
    isNotNull,
    switchMap((connection) =>
      fromEventPattern(
        (addHandler) => connection.onSlotChange(addHandler),
        (removeHandler, id) =>
          connection.removeSlotChangeListener(id).then(removeHandler)
      )
    )
  );
