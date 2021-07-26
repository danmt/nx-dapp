import { ENV as ChainID } from '@solana/spl-token-registry';

export type ENV = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';

export interface Endpoint {
  id: string;
  url: string;
  chainID: ChainID;
}
