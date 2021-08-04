import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/types';
import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import { DexMarketParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { MARKETS, TOKEN_MINTS } from '@project-serum/serum';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { Market } from '../types';
import { getMintAccounts } from './get-mint-accounts';

const getMarket = (mintAddress: string) => {
  const SERUM_TOKEN = TOKEN_MINTS.find(
    (tokenMint) => tokenMint.address.toBase58() === mintAddress
  );

  const market = MARKETS.filter((market) => !market.deprecated).find(
    (market) =>
      market.name === `${SERUM_TOKEN?.name}/USDC` ||
      market.name === `${SERUM_TOKEN?.name}/USDT`
  );

  if (!market) {
    return null;
  }

  return {
    mint: mintAddress,
    address: market.address.toBase58(),
    name: market.name,
    programId: market.programId.toBase58(),
    deprecated: market.deprecated,
  };
};

const getMarketAddresses = (mintAccounts: ParsedAccountBase[]): string[] =>
  mintAccounts
    .map((mintAddress) => getMarket(mintAddress.pubkey.toBase58()))
    .filter((market): market is Market => market !== null)
    .map((market) => market.address);

export const getMarketAccounts = (
  connection: Connection,
  userAccounts: ParsedAccountBase[]
): Observable<{
  mintAccounts: ParsedAccountBase[];
  marketAccounts: ParsedAccountBase[];
}> =>
  getMintAccounts(connection, userAccounts).pipe(
    concatMap((mintAccounts) =>
      getMultipleAccounts(
        connection,
        getMarketAddresses(mintAccounts),
        'single'
      ).pipe(
        map(({ array: marketAccounts, keys: marketAccountAddresses }) => ({
          mintAccounts,
          marketAccounts: marketAccounts.map((marketAccount, index) =>
            DexMarketParser(
              new PublicKey(marketAccountAddresses[index]),
              marketAccount
            )
          ),
        }))
      )
    )
  );
