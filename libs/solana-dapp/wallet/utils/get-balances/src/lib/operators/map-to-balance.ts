import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { MintParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Balance } from '../types';
import { createBalance } from '../utils';

export const mapToBalances =
  (tokenAccounts: TokenAccount[]) =>
  (
    source: Observable<{ array: AccountInfo<Buffer>[]; keys: string[] }>
  ): Observable<Balance[]> =>
    source.pipe(
      map(({ array: mintAccounts, keys }) =>
        mintAccounts.map((account, index) =>
          createBalance(
            tokenAccounts,
            MintParser(new PublicKey(keys[index]), account)
          )
        )
      )
    );
