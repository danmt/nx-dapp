export interface Balance {
  address: string;
  lamports: number;
  quantity: number;
  hasBalance: boolean;
}

export interface GetBalancesConfig {
  rpcEndpoint: string;
  walletPublicKey: string;
}
