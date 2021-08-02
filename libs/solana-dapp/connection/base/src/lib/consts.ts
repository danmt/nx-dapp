import { ENV as ChainID } from '@solana/spl-token-registry';
import { clusterApiUrl } from '@solana/web3.js';
import { Network, ENV } from './types';

export const NETWORKS: Network[] = [
  {
    name: 'mainnet-beta' as ENV,
    url: 'https://solana-api.projectserum.com/',
    chainID: ChainID.MainnetBeta,
  },
  {
    name: 'testnet' as ENV,
    url: clusterApiUrl('testnet'),
    chainID: ChainID.Testnet,
  },
  {
    name: 'devnet' as ENV,
    url: clusterApiUrl('devnet'),
    chainID: ChainID.Devnet,
  },
];

export const DEFAULT_NETWORK = 'mainnet-beta';
export const DEFAULT_SLIPPAGE = 0.25;
