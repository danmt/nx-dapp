import {
  MarketAccount,
  MintTokenAccount,
  OrderbookAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { calculateMidPrice } from '../operations';
import { TokenPrice } from '../types';

const createPrice = (
  mintAccount: MintTokenAccount,
  marketAccounts: MarketAccount[],
  marketMintAccounts: MintTokenAccount[],
  marketIndicatorAccounts: OrderbookAccount[]
): TokenPrice | null => {
  return {
    address: mintAccount.pubkey.toBase58(),
    price: calculateMidPrice(
      mintAccount,
      marketAccounts,
      marketMintAccounts,
      marketIndicatorAccounts
    ),
  };
};

export const mapToPrices = (
  source: Observable<{
    mintAccounts: MintTokenAccount[];
    marketAccounts: MarketAccount[];
    marketMintAccounts: MintTokenAccount[];
    marketIndicatorAccounts: OrderbookAccount[];
  }>
): Observable<TokenPrice[]> =>
  source.pipe(
    map(
      ({
        marketAccounts,
        mintAccounts,
        marketMintAccounts,
        marketIndicatorAccounts,
      }) =>
        mintAccounts
          .map((mintAccount) =>
            createPrice(
              mintAccount,
              marketAccounts,
              marketMintAccounts,
              marketIndicatorAccounts
            )
          )
          .filter((price): price is TokenPrice => price !== null)
    )
  );
