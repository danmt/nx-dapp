import { TokenAccount } from '@nx-dapp/solana-dapp/account/types';
import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import { AccountInfo, Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';

export const getMintAccounts = (
  connection: Connection,
  tokenAccounts: TokenAccount[]
): Observable<{ keys: string[]; array: AccountInfo<Buffer>[] }> =>
  getMultipleAccounts(
    connection,
    [
      ...new Set(
        tokenAccounts.map(({ info }) => info.mint.toBase58())
      ).values(),
    ],
    'recent'
  );
