import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/types';
import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import { DexMarketParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { MARKETS, TOKEN_MINTS } from '@project-serum/serum';
import { Connection, PublicKey } from '@solana/web3.js';
import { forkJoin, Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { Market } from '../types';
import { getMintAccounts } from './get-mint-accounts';
import { getNativeAccount } from './get-native-account';
import { getTokenAccounts } from './get-token-accounts';

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
  walletPublicKey: string
): Observable<{
  mintAccounts: ParsedAccountBase[];
  marketAccounts: ParsedAccountBase[];
}> =>
  forkJoin([
    getNativeAccount(connection, new PublicKey(walletPublicKey)),
    getTokenAccounts(connection, new PublicKey(walletPublicKey)),
  ]).pipe(
    map(([nativeAccount, tokenAccounts]) => [nativeAccount, ...tokenAccounts]),
    concatMap((userAccounts) => getMintAccounts(connection, userAccounts)),
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
