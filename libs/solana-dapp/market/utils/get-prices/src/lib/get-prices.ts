import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/types';
import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import {
  DexMarketParser,
  MintParser,
  OrderBookParser,
} from '@nx-dapp/solana-dapp/account/utils/serializer';
import {
  Market as SerumMarket,
  MARKETS,
  Orderbook,
  TOKEN_MINTS,
} from '@project-serum/serum';
import { Connection, PublicKey } from '@solana/web3.js';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, reduce, switchMap, tap } from 'rxjs/operators';

const STABLE_COINS = new Set(['USDC', 'wUSDC', 'USDT']);

interface TokenPrice {
  address: string;
  price: number;
}

const getBestBidOffer = (bidsBook: Orderbook, asksBook: Orderbook) => {
  const bestBid = bidsBook.getL2(1);
  const bestAsk = asksBook.getL2(1);

  if (bestBid.length > 0 && bestAsk.length > 0) {
    return (bestBid[0][0] + bestAsk[0][0]) / 2.0;
  }

  return 0;
};

const getMidPrice = (
  marketAccount: ParsedAccountBase,
  mintAddress: string,
  marketMintAccounts: ParsedAccountBase[],
  marketIndicatorAccounts: ParsedAccountBase[]
) => {
  const SERUM_TOKEN = TOKEN_MINTS.find(
    (a) => a.address.toBase58() === mintAddress
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

  const market = new SerumMarket(
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

  if (bids && asks) {
    const bidsBook = new Orderbook(market, bids.accountFlags, bids.slab);
    const asksBook = new Orderbook(market, asks.accountFlags, asks.slab);

    return getBestBidOffer(bidsBook, asksBook);
  }

  return 0;
};

const createPrice = (
  mintAccount: MintTokenAccount,
  marketAccount: ParsedAccountBase,
  marketMintAccounts: ParsedAccountBase[],
  marketIndicatorAccounts: ParsedAccountBase[]
): TokenPrice => {
  return {
    address: mintAccount.pubkey.toBase58(),
    price: getMidPrice(
      marketAccount,
      mintAccount.pubkey.toBase58(),
      marketMintAccounts,
      marketIndicatorAccounts
    ),
  };
};

export const mapToPrices =
  (mintAccounts: ParsedAccountBase[], marketAccounts: ParsedAccountBase[]) =>
  (source: Observable<[ParsedAccountBase[], ParsedAccountBase[]]>) => {
    return source.pipe(
      switchMap(([marketMintAccounts, marketIndicatorAccounts]) =>
        from(mintAccounts).pipe(
          map((mintAccount) =>
            marketAccounts
              .filter(
                (marketAccount) =>
                  marketAccount.info.baseMint.toBase58() ===
                  mintAccount.pubkey.toBase58()
              )
              .map((marketAccount) =>
                createPrice(
                  mintAccount,
                  marketAccount,
                  marketMintAccounts,
                  marketIndicatorAccounts
                )
              )
          )
        )
      ),
      reduce(
        (marketPrices: TokenPrice[], prices: TokenPrice[]) => [
          ...marketPrices,
          ...prices,
        ],
        []
      )
    );
  };

interface MarketInfo {
  address: PublicKey;
  name: string;
  programId: PublicKey;
  deprecated: boolean;
}

interface Market {
  address: string;
  marketInfo: MarketInfo;
}

const getMarketInfo = (address: string) => {
  const SERUM_TOKEN = TOKEN_MINTS.find(
    (tokenMint) => tokenMint.address.toBase58() === address
  );

  const marketInfo = MARKETS.filter((m) => !m.deprecated).find(
    (m) =>
      m.name === `${SERUM_TOKEN?.name}/USDC` ||
      m.name === `${SERUM_TOKEN?.name}/USDT`
  );

  if (!marketInfo) {
    return null;
  }

  return {
    address,
    marketInfo,
  };
};

const getMarketAccounts = (
  connection: Connection,
  mintAccounts: ParsedAccountBase[]
) =>
  getMultipleAccounts(
    connection,
    mintAccounts
      .map((mintAddress) => getMarketInfo(mintAddress.pubkey.toBase58()))
      .filter((market): market is Market => market !== null)
      .map((market) => market.marketInfo.address.toBase58()),
    'single'
  ).pipe(
    map(({ array: marketAccounts, keys: marketAccountAddresses }) =>
      marketAccounts.map((marketAccount, index) =>
        DexMarketParser(
          new PublicKey(marketAccountAddresses[index]),
          marketAccount
        )
      )
    )
  );

const getMarketMintAccount = (
  connection: Connection,
  marketAccount: ParsedAccountBase
) =>
  getMultipleAccounts(
    connection,
    [
      marketAccount.info.baseMint.toBase58(),
      marketAccount.info.quoteMint.toBase58(),
    ],
    'single'
  ).pipe(
    map(({ array: marketMintAccounts, keys: marketMintAddresses }) =>
      marketMintAccounts.map((marketMintAccount, index) =>
        MintParser(new PublicKey(marketMintAddresses[index]), marketMintAccount)
      )
    )
  );

const getMarketMintAccounts = (
  connection: Connection,
  marketAccounts: ParsedAccountBase[]
): Observable<ParsedAccountBase[]> =>
  forkJoin(
    marketAccounts.map((marketAccount) =>
      getMarketMintAccount(connection, marketAccount)
    )
  ).pipe(
    map((marketMintAccountsList) => [
      ...marketMintAccountsList
        .reduce((marketMintAccounts, accounts) => {
          accounts.forEach((account) => {
            marketMintAccounts.set(account.pubkey.toBase58(), account);
          });

          return new Map<string, ParsedAccountBase>(marketMintAccounts);
        }, new Map<string, ParsedAccountBase>())
        .values(),
    ])
  );

export const getMintAccounts = (
  connection: Connection,
  userAccounts: TokenAccount[]
): Observable<ParsedAccountBase[]> =>
  getMultipleAccounts(
    connection,
    [...new Set(userAccounts.map(({ info }) => info.mint.toBase58())).values()],
    'recent'
  ).pipe(
    map(({ array: mintAccounts, keys }) =>
      mintAccounts.map((account, index) =>
        MintParser(new PublicKey(keys[index]), account)
      )
    )
  );

const getMarketIndicatorAccount = (
  connection: Connection,
  marketAccount: ParsedAccountBase
) =>
  getMultipleAccounts(
    connection,
    [marketAccount.info.asks.toBase58(), marketAccount.info.bids.toBase58()],
    'single'
  ).pipe(
    map(({ array: marketIndicatorAccounts, keys: marketIndicatorAddresses }) =>
      marketIndicatorAccounts.map((marketIndicatorAccount, index) =>
        OrderBookParser(
          new PublicKey(marketIndicatorAddresses[index]),
          marketIndicatorAccount
        )
      )
    )
  );

const getMarketIndicatorAccounts = (
  connection: Connection,
  marketAccounts: ParsedAccountBase[]
): Observable<ParsedAccountBase[]> =>
  forkJoin(
    marketAccounts.map((marketAccount) =>
      getMarketIndicatorAccount(connection, marketAccount)
    )
  ).pipe(
    map((marketIndicatorAccountsList) => [
      ...marketIndicatorAccountsList
        .reduce((marketIndicatorAccounts, accounts) => {
          accounts.forEach((account) => {
            marketIndicatorAccounts.set(account.pubkey.toBase58(), account);
          });

          return new Map<string, ParsedAccountBase>(marketIndicatorAccounts);
        }, new Map<string, ParsedAccountBase>())
        .values(),
    ])
  );

export const getPrices = (
  rpcEndpoint: string,
  userAccounts: TokenAccount[]
): Observable<TokenPrice[]> =>
  of(new Connection(rpcEndpoint, 'recent')).pipe(
    switchMap((connection) =>
      getMintAccounts(connection, userAccounts).pipe(
        switchMap((mintAccounts) =>
          getMarketAccounts(connection, mintAccounts).pipe(
            switchMap((marketAccounts) =>
              forkJoin([
                getMarketMintAccounts(connection, marketAccounts),
                getMarketIndicatorAccounts(connection, marketAccounts),
              ]).pipe(mapToPrices(mintAccounts, marketAccounts))
            )
          )
        )
      )
    )
  );
