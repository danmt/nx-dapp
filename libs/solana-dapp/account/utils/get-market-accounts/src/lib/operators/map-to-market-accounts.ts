import {
  MarketAccount,
  MintTokenAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/generics';
import { DexMarketParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Market } from '@nx-dapp/solana-dapp/market/types';
import { MARKETS, TOKEN_MINTS } from '@project-serum/serum';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

const getMarket = (mintAddress: string): Market | null => {
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

const getMarketAddresses = (mintAccounts: MintTokenAccount[]): string[] =>
  mintAccounts
    .map((mintAddress) => getMarket(mintAddress.pubkey.toBase58()))
    .filter((market): market is Market => market !== null)
    .map((market) => market.address);

export const mapToMarketAccounts =
  (marketConnection: Connection) =>
  (source: Observable<MintTokenAccount[]>): Observable<MarketAccount[]> =>
    source.pipe(
      concatMap((mintAccounts) =>
        getMultipleAccounts(
          marketConnection,
          getMarketAddresses(mintAccounts),
          'single'
        ).pipe(
          map(({ array: marketAccounts, keys: marketAccountAddresses }) =>
            marketAccounts.map((marketAccount, index) =>
              DexMarketParser(
                new PublicKey(marketAccountAddresses[index]),
                marketAccount
              )
            )
          )
        )
      )
    );
