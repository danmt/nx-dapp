import { ENV as ChainID } from '@solana/spl-token-registry';
import { clusterApiUrl } from '@solana/web3.js';
import { Endpoint, ENV } from './types';

export const ENDPOINTS: Endpoint[] = [
  {
    name: 'mainnet-beta' as ENV,
    endpoint: 'https://solana-api.projectserum.com/',
    chainID: ChainID.MainnetBeta,
  },
  {
    name: 'testnet' as ENV,
    endpoint: clusterApiUrl('testnet'),
    chainID: ChainID.Testnet,
  },
  {
    name: 'devnet' as ENV,
    endpoint: clusterApiUrl('devnet'),
    chainID: ChainID.Devnet,
  },
  {
    name: 'localnet' as ENV,
    endpoint: 'http://127.0.0.1:8899',
    chainID: ChainID.Devnet,
  },
];

export const DEFAULT_ENDPOINT = ENDPOINTS[0].endpoint;
export const DEFAULT_SLIPPAGE = 0.25;
