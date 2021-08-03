import { MintTokenAccount } from '@nx-dapp/solana-dapp/account';
import { MarketInfo, SerumMarket } from '@nx-dapp/solana-dapp/types';
import { MARKETS, TOKEN_MINTS } from '@project-serum/serum';

const getMarketByAddress = (address: string) => {
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

export const getMarketByMint = (
  mintAccounts: Map<string, MintTokenAccount>
) => {
  const mintAddresses = [
    ...new Set(
      [...mintAccounts.values()].map((mintAccount) =>
        mintAccount.pubkey.toBase58()
      )
    ).values(),
  ];

  return mintAddresses
    .map((marketAddress) => getMarketByAddress(marketAddress))
    .filter(
      (data): data is { address: string; marketInfo: MarketInfo } =>
        data !== null
    )
    .reduce((marketByMint, { address, marketInfo }) => {
      marketByMint.set(address, { marketInfo });
      return marketByMint;
    }, new Map<string, SerumMarket>());
};
