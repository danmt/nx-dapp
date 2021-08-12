import { Balance, TokenInfo, TokenPrice } from '@nx-dapp/solana-dapp/angular';

import { Portfolio, Position } from '../types';

const createPositions = (
  tokens: Map<string, TokenInfo>,
  balances: Balance[],
  tokenPrices: TokenPrice[]
): Position[] => {
  return balances.map((balance) => {
    const token = tokens.get(balance.address);
    const tokenPrice = tokenPrices.find(
      (tokenPrice) => tokenPrice.address === balance.address
    );

    return {
      name: token?.name || 'Unrecognized Token',
      symbol: token?.symbol || '?',
      address: balance.address,
      logo: token?.logoURI || '',
      quantity: balance.quantity,
      price: tokenPrice?.price || 0,
      total: balance.quantity * (tokenPrice?.price || 0),
      isStable: tokenPrice?.isStable || false,
    };
  });
};

const calculateTotal = (positions: Position[]): number =>
  positions.reduce((total, position) => total + position.total, 0);

export const createPortfolio = (
  balances: Balance[],
  tokenPrices: TokenPrice[],
  tokens: Map<string, TokenInfo>
): Portfolio => {
  if (balances.length === 0) {
    return {
      totalInUSD: 0,
      positions: [],
      stableCoinsTotalInUSD: 0,
      nonStableCoinsTotalInUSD: 0,
    };
  }

  const positions = createPositions(tokens, balances, tokenPrices);

  return {
    positions,
    totalInUSD: calculateTotal(positions),
    stableCoinsTotalInUSD: calculateTotal(
      positions.filter((position) => position.isStable)
    ),
    nonStableCoinsTotalInUSD: calculateTotal(
      positions.filter((position) => !position.isStable)
    ),
  };
};
