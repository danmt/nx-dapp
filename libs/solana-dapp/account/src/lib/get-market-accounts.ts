import { ParsedAccountBase } from '@nx-dapp/solana-dapp/types/account';
import { SerumMarket } from '@nx-dapp/solana-dapp/types/market';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { getMultipleAccounts } from './get-multiple-accounts';
import { DexMarketParser } from './serializer';

export const getMarketAccounts = (
  marketByMint: Map<string, SerumMarket>,
  connection: Connection
): Observable<Map<string, ParsedAccountBase>> =>
  getMultipleAccounts(
    connection,
    [...marketByMint.values()].map((market) =>
      market.marketInfo.address.toBase58()
    ),
    'single'
  ).pipe(
    map(({ array: marketAccounts, keys: marketAccountAddresses }) =>
      marketAccounts
        .map((marketAccount, index) =>
          DexMarketParser(
            new PublicKey(marketAccountAddresses[index]),
            marketAccount
          )
        )
        .reduce(
          (marketAccounts, marketAccount) =>
            marketAccounts.set(marketAccount.pubkey.toBase58(), marketAccount),
          new Map<string, ParsedAccountBase>()
        )
    )
  );
