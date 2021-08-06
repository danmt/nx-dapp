import {
  MarketAccount,
  MarketAccounts,
  MintTokenAccount,
  OrderbookAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { TokenPrice } from '@nx-dapp/solana-dapp/market/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { calculateMidPrice } from '../operations';

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

export const mapToPrices =
  (mintAccounts: MintTokenAccount[]) =>
  (source: Observable<MarketAccounts>): Observable<TokenPrice[]> =>
    source.pipe(
      map(({ accounts, mints, indicators }) =>
        mintAccounts
          .map((mintAccount) =>
            createPrice(mintAccount, accounts, mints, indicators)
          )
          .filter((price): price is TokenPrice => price !== null)
      )
    );
