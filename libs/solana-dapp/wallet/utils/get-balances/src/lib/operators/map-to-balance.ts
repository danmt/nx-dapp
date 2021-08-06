import { MintTokenAccount, TokenAccount } from '@nx-dapp/solana-dapp/account';
import { Balance } from '@nx-dapp/solana-dapp/wallet/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { calculateBalance } from '../operations';

export const mapToBalance =
  (userAccounts: TokenAccount[]) =>
  (source: Observable<MintTokenAccount | null>): Observable<Balance | null> =>
    source.pipe(
      map((mintAccount) =>
        mintAccount ? calculateBalance(userAccounts, mintAccount) : null
      )
    );
