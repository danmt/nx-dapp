import { ENV as ChainID } from '@solana/spl-token-registry';

export type ENV = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';

export interface Network {
  name: ENV;
  url: string;
  chainID: ChainID;
}
