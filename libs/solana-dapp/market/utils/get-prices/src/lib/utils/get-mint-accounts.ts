import {
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import { MintParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const getMintAccounts = (
  connection: Connection,
  userAccounts: TokenAccount[]
): Observable<ParsedAccountBase[]> =>
  getMultipleAccounts(
    connection,
    [...new Set(userAccounts.map(({ info }) => info.mint.toBase58())).values()],
    'recent'
  ).pipe(
    map(({ array: mintAccounts, keys }) =>
      mintAccounts.map((account, index) =>
        MintParser(new PublicKey(keys[index]), account)
      )
    )
  );
