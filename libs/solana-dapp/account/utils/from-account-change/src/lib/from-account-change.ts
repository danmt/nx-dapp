import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { fromEventPattern } from 'rxjs';

export const fromAccountChangeEvent = <T>(
  connection: Connection,
  pubkey: PublicKey
) =>
  fromEventPattern<T>(
    (addHandler) => connection.onAccountChange(pubkey, addHandler),
    (removeHandler, id) =>
      connection.removeAccountChangeListener(id).then(removeHandler)
  );
