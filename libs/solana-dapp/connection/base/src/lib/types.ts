import { ENV as ChainID } from '@solana/spl-token-registry';

export type ENV = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';

export interface Endpoint {
  name: ENV;
  endpoint: string;
  chainID: ChainID;
}
