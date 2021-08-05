import {
  MarketAccount,
  MintTokenAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import { MintParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const getMarketMintAddresses = (marketAccounts: MarketAccount[]): string[] => [
  ...new Set(
    marketAccounts.reduce(
      (marketMintAccounts: string[], marketAccount: MarketAccount) => [
        ...marketMintAccounts,
        marketAccount.info.baseMint.toBase58(),
        marketAccount.info.quoteMint.toBase58(),
      ],
      []
    )
  ).values(),
];

export const getMarketMintAccounts = (
  connection: Connection,
  marketAccounts: MarketAccount[]
): Observable<MintTokenAccount[]> =>
  getMultipleAccounts(
    connection,
    getMarketMintAddresses(marketAccounts),
    'single'
  ).pipe(
    map(({ array: marketMintAccounts, keys: marketMintAddresses }) =>
      marketMintAccounts.map((marketMintAccount, index) =>
        MintParser(new PublicKey(marketMintAddresses[index]), marketMintAccount)
      )
    )
  );
