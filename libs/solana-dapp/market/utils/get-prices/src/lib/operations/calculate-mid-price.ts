import {
  MarketAccount,
  MintTokenAccount,
  OrderbookAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { Market, Orderbook, TOKEN_MINTS } from '@project-serum/serum';

import { calculateBestBidOffer } from './calculate-best-bid-offer';

const STABLE_COINS = new Set(['USDC', 'wUSDC', 'USDT']);

export const calculateMidPrice = (
  mintAccount: MintTokenAccount,
  marketAccounts: MarketAccount[],
  marketMintAccounts: MintTokenAccount[],
  marketIndicatorAccounts: OrderbookAccount[]
): number => {
  const SERUM_TOKEN = TOKEN_MINTS.find(({ address }) =>
    address.equals(mintAccount.pubkey)
  );

  if (STABLE_COINS.has(SERUM_TOKEN?.name || '')) {
    return 1.0;
  }

  const marketAccount = marketAccounts.find(({ info }) =>
    info.baseMint.equals(mintAccount.pubkey)
  );

  if (!marketAccount) {
    return 0;
  }

  const decodedMarket = marketAccount.info;

  const baseMintDecimals =
    marketMintAccounts.find(({ pubkey }) =>
      pubkey.equals(decodedMarket.baseMint)
    )?.info.decimals || 0;
  const quoteMintDecimals =
    marketMintAccounts.find(({ pubkey }) =>
      pubkey.equals(decodedMarket.quoteMint)
    )?.info.decimals || 0;

  const market = new Market(
    decodedMarket,
    baseMintDecimals,
    quoteMintDecimals,
    undefined,
    decodedMarket.programId
  );

  const bids = marketIndicatorAccounts.find(({ pubkey }) =>
    pubkey.equals(decodedMarket.bids)
  )?.info;
  const asks = marketIndicatorAccounts.find(({ pubkey }) =>
    pubkey.equals(decodedMarket.asks)
  )?.info;

  if (!bids || !asks) {
    return 0;
  }

  const bidsBook = new Orderbook(market, bids.accountFlags, bids.slab);
  const asksBook = new Orderbook(market, asks.accountFlags, asks.slab);

  return calculateBestBidOffer(bidsBook, asksBook);
};

export const calculateMidPrice2 = (
  mintAccount: MintTokenAccount,
  marketAccount: MarketAccount,
  marketMintAccounts: MintTokenAccount[],
  orderbookAccounts: OrderbookAccount[]
): number => {
  const SERUM_TOKEN = TOKEN_MINTS.find(({ address }) =>
    address.equals(mintAccount.pubkey)
  );

  if (STABLE_COINS.has(SERUM_TOKEN?.name || '')) {
    return 1.0;
  }

  const decodedMarket = marketAccount.info;

  const baseMintDecimals =
    marketMintAccounts.find(({ pubkey }) =>
      pubkey.equals(decodedMarket.baseMint)
    )?.info.decimals || 0;
  const quoteMintDecimals =
    marketMintAccounts.find(({ pubkey }) =>
      pubkey.equals(decodedMarket.quoteMint)
    )?.info.decimals || 0;

  const market = new Market(
    decodedMarket,
    baseMintDecimals,
    quoteMintDecimals,
    undefined,
    decodedMarket.programId
  );

  const bids = orderbookAccounts.find(({ pubkey }) =>
    pubkey.equals(decodedMarket.bids)
  )?.info;
  const asks = orderbookAccounts.find(({ pubkey }) =>
    pubkey.equals(decodedMarket.asks)
  )?.info;

  if (!bids || !asks) {
    return 0;
  }

  const bidsBook = new Orderbook(market, bids.accountFlags, bids.slab);
  const asksBook = new Orderbook(market, asks.accountFlags, asks.slab);

  return calculateBestBidOffer(bidsBook, asksBook);
};
