import { ParsedAccountBase } from '@nx-dapp/solana/account-adapter/base';
import { Market, Orderbook, TOKEN_MINTS } from '@project-serum/serum';

export const STABLE_COINS = new Set(['USDC', 'wUSDC', 'USDT']);

const bestBidOffer = (bidsBook: Orderbook, asksBook: Orderbook) => {
  const bestBid = bidsBook.getL2(1);
  const bestAsk = asksBook.getL2(1);

  if (bestBid.length > 0 && bestAsk.length > 0) {
    return (bestBid[0][0] + bestAsk[0][0]) / 2.0;
  }

  return 0;
};

export const getMidPrice = (
  marketAddress: string | undefined,
  mintAddress: string,
  marketAccounts: ParsedAccountBase[],
  marketHelperAccounts: ParsedAccountBase[]
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
    marketHelperAccounts?.find(
      (account) =>
        account.pubkey.toBase58() === decodedMarket.baseMint.toBase58()
    )?.info.decimals || 0;
  const quoteMintDecimals =
    marketHelperAccounts?.find(
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

  const bids = marketHelperAccounts?.find(
    (account) => account.pubkey.toBase58() === decodedMarket.bids.toBase58()
  )?.info;
  const asks = marketHelperAccounts?.find(
    (account) => account.pubkey.toBase58() === decodedMarket.asks.toBase58()
  )?.info;

  if (bids && asks) {
    const bidsBook = new Orderbook(market, bids.accountFlags, bids.slab);
    const asksBook = new Orderbook(market, asks.accountFlags, asks.slab);

    return bestBidOffer(bidsBook, asksBook);
  }

  return 0;
};
