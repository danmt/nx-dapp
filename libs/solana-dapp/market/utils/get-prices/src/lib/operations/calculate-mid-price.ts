import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/types';
import { Market, Orderbook, TOKEN_MINTS } from '@project-serum/serum';
import { calculateBestBidOffer } from './calculate-best-bid-offer';

const STABLE_COINS = new Set(['USDC', 'wUSDC', 'USDT']);

export const calculateMidPrice = (
  marketAccount: ParsedAccountBase,
  mintAddress: string,
  marketMintAccounts: ParsedAccountBase[],
  marketIndicatorAccounts: ParsedAccountBase[]
) => {
  const SERUM_TOKEN = TOKEN_MINTS.find(
    ({ address }) => address.toBase58() === mintAddress
  );

  if (STABLE_COINS.has(SERUM_TOKEN?.name || '')) {
    return 1.0;
  }

  const decodedMarket = marketAccount.info;

  const baseMintDecimals =
    marketMintAccounts.find(
      (account) =>
        account.pubkey.toBase58() === decodedMarket.baseMint.toBase58()
    )?.info.decimals || 0;
  const quoteMintDecimals =
    marketMintAccounts.find(
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

  const bids = marketIndicatorAccounts.find(
    (account) => account.pubkey.toBase58() === decodedMarket.bids.toBase58()
  )?.info;
  const asks = marketIndicatorAccounts.find(
    (account) => account.pubkey.toBase58() === decodedMarket.asks.toBase58()
  )?.info;

  if (!bids || !asks) {
    return 0;
  }

  const bidsBook = new Orderbook(market, bids.accountFlags, bids.slab);
  const asksBook = new Orderbook(market, asks.accountFlags, asks.slab);

  return calculateBestBidOffer(bidsBook, asksBook);
};
