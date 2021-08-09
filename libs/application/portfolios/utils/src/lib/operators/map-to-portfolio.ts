import { Balance, TokenInfo, TokenPrice } from '@nx-dapp/solana-dapp/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Portfolio, Position } from '../types';

const getPositions = (
  tokens: TokenInfo[],
  balances: Balance[],
  tokenPrices: TokenPrice[]
): Position[] => {
  return tokens
    .filter((token) =>
      balances.some((balance) => balance.address === token.address)
    )
    .map((token) => {
      const quantity =
        balances.find((balance) => balance.address === token.address)
          ?.quantity || 0;
      const tokenPrice = tokenPrices.find(
        (tokenPrice) => tokenPrice.address === token.address
      );
      return {
        name: token.name,
        symbol: token.symbol,
        address: token.address,
        logo: token.logoURI || '',
        quantity,
        price: tokenPrice?.price || 0,
        total: quantity * (tokenPrice?.price || 0),
        isStable: tokenPrice?.isStable || false,
      };
    });
};

const calculateTotal = (positions: Position[]) =>
  positions.reduce((total, position) => total + position.total, 0);

export const mapToPortfolio = (
  source: Observable<[Balance[], TokenInfo[], TokenPrice[]]>
): Observable<Portfolio> =>
  source.pipe(
    map(([balances, tokens, tokenPrices]) => {
      if (balances.length === 0 || tokenPrices.length === 0) {
        return {
          totalInUSD: 0,
          positions: [],
          stableCoinsTotalInUSD: 0,
          nonStableCoinsTotalInUSD: 0,
        };
      }

      const positions = getPositions(tokens, balances, tokenPrices);

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
    })
  );
