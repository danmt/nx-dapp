import { ENV as ChainID } from '@solana/spl-token-registry';
import { Network, ENV } from '@nx-dapp/solana-dapp/connection/base';

export const DEFAULT_MARKET_NETWORK: Network = {
  name: 'mainnet-beta' as ENV,
  url: 'https://solana-api.projectserum.com/',
  chainID: ChainID.MainnetBeta,
};
