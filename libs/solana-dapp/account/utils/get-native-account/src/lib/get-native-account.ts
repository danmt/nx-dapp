import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { TokenAccount } from '@nx-dapp/solana-dapp/types/account';
import { u64 } from '@nx-dapp/solana-dapp/utils/u64';
import { NATIVE_MINT } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const getNativeAccount = (
  connection: Connection,
  pubkey: PublicKey
): Observable<TokenAccount> =>
  from(defer(() => connection.getAccountInfo(pubkey))).pipe(
    isNotNull,
    map((account) => ({
      pubkey: pubkey,
      account,
      info: {
        address: pubkey,
        mint: NATIVE_MINT,
        owner: pubkey,
        amount: new u64(account.lamports),
        delegate: null,
        delegatedAmount: new u64(0),
        isInitialized: true,
        isFrozen: false,
        isNative: true,
        rentExemptReserve: null,
        closeAuthority: null,
      },
    }))
  );
