export interface TokenPrice {
  address: string;
  price: number;
}

export interface Market {
  mint: string;
  address: string;
  name: string;
  programId: string;
  deprecated: boolean;
}
