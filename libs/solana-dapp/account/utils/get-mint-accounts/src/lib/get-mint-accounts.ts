import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import { MintParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { MintTokenAccount } from '@nx-dapp/solana-dapp/types/account';
import { TokenDetails } from '@nx-dapp/solana-dapp/types/market';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map, reduce } from 'rxjs/operators';

const getAccounts = (
  connection: Connection,
  mintTokens: TokenDetails[]
): Observable<MintTokenAccount[]> =>
  getMultipleAccounts(
    connection,
    mintTokens.map((mintToken) => mintToken.pubkey.toBase58()),
    'single'
  ).pipe(
    map(({ array: mintAccounts, keys: mintAddresses }) =>
      mintAccounts.map((mintAccount, index) =>
        MintParser(new PublicKey(mintAddresses[index]), mintAccount)
      )
    )
  );

export const getMintAccounts = (
  connection: Connection,
  mintTokens: TokenDetails[]
): Observable<Map<string, MintTokenAccount>> =>
  getAccounts(connection, mintTokens).pipe(
    reduce((mintAccounts, accounts) => {
      accounts.forEach((account) =>
        mintAccounts.set(account.pubkey.toBase58(), account)
      );

      return new Map(mintAccounts);
    }, new Map<string, MintTokenAccount>())
  );
