export interface Position {
  name: string;
  symbol: string;
  address: string;
  quantity: number;
  price: number;
  logo: string;
  total: number;
  isStable: boolean;
  isNative: boolean;
  decimals: number;
  associatedTokenAddress?: string;
}

export interface Portfolio {
  stableCoinsTotalInUSD: number;
  nonStableCoinsTotalInUSD: number;
  totalInUSD: number;
  positions: Position[];
}
