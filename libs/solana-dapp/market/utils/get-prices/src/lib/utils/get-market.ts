import { MARKETS, TOKEN_MINTS } from '@project-serum/serum';

export const getMarket = (mintAddress: string) => {
  const SERUM_TOKEN = TOKEN_MINTS.find(
    (tokenMint) => tokenMint.address.toBase58() === mintAddress
  );

  const market = MARKETS.filter((market) => !market.deprecated).find(
    (market) =>
      market.name === `${SERUM_TOKEN?.name}/USDC` ||
      market.name === `${SERUM_TOKEN?.name}/USDT`
  );

  if (!market) {
    return null;
  }

  return {
    mint: mintAddress,
    address: market.address.toBase58(),
    name: market.name,
    programId: market.programId.toBase58(),
    deprecated: market.deprecated,
  };
};
