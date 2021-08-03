import { ENV, Network } from '@nx-dapp/solana-dapp/connection/types';
import { ENV as ChainID } from '@solana/spl-token-registry';

export const DEFAULT_MARKET_NETWORK: Network = {
  name: 'mainnet-beta' as ENV,
  url: 'https://solana-api.projectserum.com/',
  chainID: ChainID.MainnetBeta,
};
