import {
  MarketAccount,
  MintTokenAccount,
  OrderbookAccount,
} from '@nx-dapp/solana-dapp/account';
import { Market, Orderbook, TOKEN_MINTS } from '@project-serum/serum';
import { PublicKey } from '@solana/web3.js';

import { calculateBestBidOffer } from '../operations';

const STABLE_COINS = new Set(['USDC', 'wUSDC', 'USDT']);

const getMintDecimals = (mintAccounts: MintTokenAccount[], pubkey: PublicKey) =>
  mintAccounts.find((mintAccount) => mintAccount.pubkey.equals(pubkey))?.info
    .decimals || 0;

export const getTokenPriceByMint = (
  mintAccount: MintTokenAccount,
  marketAccount: MarketAccount | null,
  marketMintAccounts: MintTokenAccount[],
  orderbookAccounts: OrderbookAccount[]
): number => {
  const SERUM_TOKEN = TOKEN_MINTS.find((tokenMint) =>
    tokenMint.address.equals(mintAccount.pubkey)
  );

  if (STABLE_COINS.has(SERUM_TOKEN?.name || '')) {
    return 1;
  }

  if (!marketAccount) {
    return 0;
  }

  const bidsAccount = orderbookAccounts.find(({ pubkey }) =>
    pubkey.equals(marketAccount.info.bids)
  );
  const asksAccount = orderbookAccounts.find(({ pubkey }) =>
    pubkey.equals(marketAccount.info.asks)
  );

  if (!bidsAccount || !asksAccount) {
    return 0;
  }

  const market = new Market(
    marketAccount.info,
    getMintDecimals(marketMintAccounts, marketAccount.info.baseMint),
    getMintDecimals(marketMintAccounts, marketAccount.info.quoteMint),
    undefined,
    marketAccount.info.programId
  );

  return calculateBestBidOffer(
    new Orderbook(market, bidsAccount.info.accountFlags, bidsAccount.info.slab),
    new Orderbook(market, asksAccount.info.accountFlags, asksAccount.info.slab)
  );
};
