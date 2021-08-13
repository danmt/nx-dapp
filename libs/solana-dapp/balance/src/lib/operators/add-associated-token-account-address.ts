import { getAssociatedTokenPublicKey } from '@nx-dapp/solana-dapp/account';
import { Balance } from '@nx-dapp/solana-dapp/utils/types';
import { PublicKey } from '@solana/web3.js';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export const addAssociatedTokenAccountAddress =
  (walletPublicKey: PublicKey) =>
  (source: Observable<Balance | null>): Observable<Balance | null> =>
    source.pipe(
      switchMap((balance) => {
        if (!balance) {
          return of(null);
        }

        if (balance.isNative) {
          return of(balance);
        }

        return getAssociatedTokenPublicKey(
          walletPublicKey,
          new PublicKey(balance.address)
        ).pipe(
          map((associatedTokenPublicKey) => ({
            ...balance,
            associatedTokenAddress: associatedTokenPublicKey.toBase58(),
          }))
        );
      })
    );
