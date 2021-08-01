import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { AccountInfo, Connection, Keypair } from '@solana/web3.js';
import { fromEventPattern, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const fromAccountChangeEvent = (source: Observable<Connection | null>) =>
  source.pipe(
    isNotNull,
    switchMap((connection) =>
      fromEventPattern<AccountInfo<Buffer>>(
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
