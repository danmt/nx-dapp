import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { SerumMarket, TokenDetails } from '@nx-dapp/solana-dapp/market/types';
import { Balance } from '@nx-dapp/solana-dapp/balance/types';
import { Market, Orderbook, TOKEN_MINTS } from '@project-serum/serum';
import { MintInfo } from '@solana/spl-token';
import { TokenInfo } from '@solana/spl-token-registry';
import { from, Observable } from 'rxjs';
import { map, toArray } from 'rxjs/operators';

const STABLE_COINS = new Set(['USDC', 'wUSDC', 'USDT']);

const getBestBidOffer = (bidsBook: Orderbook, asksBook: Orderbook) => {
  const bestBid = bidsBook.getL2(1);
  const bestAsk = asksBook.getL2(1);

  if (bestBid.length > 0 && bestAsk.length > 0) {
    return (bestBid[0][0] + bestAsk[0][0]) / 2.0;
  }

  return 0;
};

const fromLamports = (lamports: number, mint: MintInfo, rate = 1) => {
  const amount = Math.floor(lamports);

  const precision = Math.pow(10, mint?.decimals || 0);
  return (amount / precision) * rate;
};

const getMidPrice = (
  marketAddress: string | undefined,
  mintAddress: string,
  marketAccounts: Map<string, ParsedAccountBase>,
  marketMintAccounts: Map<string, ParsedAccountBase>,
  marketIndicatorAccounts: Map<string, ParsedAccountBase>
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

  const marketAccount = marketAccounts.get(marketAddress);

  if (!marketAccount) {
    return 0.0;
  }

  const decodedMarket = marketAccount.info;

  const baseMintDecimals =
    marketMintAccounts.get(decodedMarket.baseMint.toBase58())?.info.decimals ||
    0;
  const quoteMintDecimals =
    marketMintAccounts.get(decodedMarket.quoteMint.toBase58())?.info.decimals ||
    0;

  const market = new Market(
    decodedMarket,
    baseMintDecimals,
    quoteMintDecimals,
    undefined,
    decodedMarket.programId
  );

  const bids = marketIndicatorAccounts.get(decodedMarket.bids.toBase58())?.info;
  const asks = marketIndicatorAccounts.get(decodedMarket.asks.toBase58())?.info;

  if (bids && asks) {
    const bidsBook = new Orderbook(market, bids.accountFlags, bids.slab);
    const asksBook = new Orderbook(market, asks.accountFlags, asks.slab);

    return getBestBidOffer(bidsBook, asksBook);
  }

  return 0;
};

const createBalance = (
  tokenAccounts: Map<string, TokenAccount>,
  mintTokens: TokenDetails[],
  networkTokens: Map<string, TokenInfo>,
  mintAccount: MintTokenAccount,
  marketByMint: Map<string, SerumMarket>,
  marketAccounts: Map<string, ParsedAccountBase>,
  marketMintAccounts: Map<string, ParsedAccountBase>,
  marketIndicatorAccounts: Map<string, ParsedAccountBase>
): Balance => {
  const filteredTokenAccounts = [...tokenAccounts.values()].filter(
    (tokenAccount) =>
      tokenAccount.info.mint.toBase58() === mintAccount.pubkey.toBase58()
  );
  const networkToken = networkTokens.get(mintAccount.pubkey.toBase58()) || null;
  const mintToken =
    mintTokens.find(
      (token) => token.address === mintAccount.pubkey.toBase58()
    ) || null;
  const lamports = filteredTokenAccounts.reduce(
    (res, item) => (res += item.info.amount.toNumber()),
    0
  );
  const tokenQuantity = fromLamports(lamports, mintAccount.info);
  const marketAddress = marketByMint
    .get(mintAccount.pubkey.toBase58())
    ?.marketInfo.address.toBase58();
  const tokenPrice = getMidPrice(
    marketAddress,
    mintAccount.pubkey.toBase58(),
    marketAccounts,
    marketMintAccounts,
    marketIndicatorAccounts
  );

  return {
    mintAddress: mintAccount.pubkey.toBase58(),
    tokenName: mintToken?.label || null,
    tokenSymbol: networkToken?.symbol || null,
    tokenLogo: networkToken?.logoURI || null,
    lamports,
    accounts: filteredTokenAccounts.sort((a, b) =>
      b.info.amount.sub(a.info.amount).toNumber()
    ),
    tokenQuantity,
    tokenPrice,
    tokenInUSD: tokenQuantity * tokenPrice,
    hasBalance: tokenQuantity > 0 && filteredTokenAccounts.length > 0,
  };
};

export const getBalances = (
  mintAccounts: Map<string, MintTokenAccount>,
  tokenAccounts: Map<string, TokenAccount>,
  mintTokens: TokenDetails[],
  networkTokens: Map<string, TokenInfo>,
  marketByMint: Map<string, SerumMarket>,
  marketAccounts: Map<string, ParsedAccountBase>,
  marketMintAccounts: Map<string, ParsedAccountBase>,
  marketIndicatorAccounts: Map<string, ParsedAccountBase>
): Observable<Balance[]> =>
  from(mintAccounts.values()).pipe(
    map((mintAccount) =>
      createBalance(
        tokenAccounts,
        mintTokens,
        networkTokens,
        mintAccount,
        marketByMint,
        marketAccounts,
        marketMintAccounts,
        marketIndicatorAccounts
      )
    ),
    toArray()
  );
