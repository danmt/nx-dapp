import { Market, MARKETS, Orderbook, TOKEN_MINTS } from '@project-serum/serum';
import {
  MintTokenAccount,
  ParsedAccountBase,
} from '@nx-dapp/solana/account-adapter/base';
import { Connection } from '@solana/web3.js';

export const STABLE_COINS = new Set(['USDC', 'wUSDC', 'USDT']);

export const getMidPrice = (
  marketAddress?: string,
  mintAddress?: string,
  marketAccounts?: ParsedAccountBase[],
  mintAccounts?: MintTokenAccount[],
  connection?: Connection
) => {
  const SERUM_TOKEN = TOKEN_MINTS.find(
    (a) => a.address.toBase58() === mintAddress
  );

  if (STABLE_COINS.has(SERUM_TOKEN?.name || '')) {
    return 1.0;
  }

  if (!marketAddress) {
    return 0.0;
  }

  const marketAccount =
    marketAccounts?.find(
      (account) => account.pubkey.toBase58() === marketAddress
    ) || null;

  if (!marketAccount) {
    return 0.0;
  }

  const decodedMarket = marketAccount.info;

  const baseMintDecimals =
    mintAccounts?.find(
      (account) =>
        account.pubkey.toBase58() === decodedMarket.baseMint.toBase58()
    )?.info.decimals || 0;
  const quoteMintDecimals =
    mintAccounts?.find(
      (account) =>
        account.pubkey.toBase58() === decodedMarket.quoteMint.toBase58()
    )?.info.decimals || 0;

  const market = new Market(
    decodedMarket,
    baseMintDecimals,
    quoteMintDecimals,
    undefined,
    decodedMarket.programId
  );

  /* const bids = cache.get(decodedMarket.bids)?.info;
  const asks = cache.get(decodedMarket.asks)?.info;

  if (bids && asks) {
    const bidsBook = new Orderbook(market, bids.accountFlags, bids.slab);
    const asksBook = new Orderbook(market, asks.accountFlags, asks.slab);

    return bbo(bidsBook, asksBook);
  } */

  return 0;
};
