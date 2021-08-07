import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { TokenAccount } from '@nx-dapp/solana-dapp/account';
import { u64 } from '@nx-dapp/solana-dapp/utils';
import { NATIVE_MINT } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const getNativeAccount = (
  connection: Connection,
  walletPublicKey: PublicKey
): Observable<TokenAccount> =>
  from(defer(() => connection.getAccountInfo(walletPublicKey))).pipe(
    isNotNull,
    map((account) => ({
      pubkey: walletPublicKey,
      account,
      info: {
        address: walletPublicKey,
        mint: NATIVE_MINT,
        owner: walletPublicKey,
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
