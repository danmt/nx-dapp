import { DEFAULT_ENDPOINT, ENV } from '@nx-dapp/solana-dapp/connection/base';
import { DEFAULT_WALLET } from '@nx-dapp/solana-dapp/wallet/base';
import {
  getPhantomWallet,
  getSolletWallet,
  getSolongWallet,
} from '@nx-dapp/solana-dapp/wallet/wallets';
import { NATIVE_MINT } from '@solana/spl-token';
import { ENV as ChainID } from '@solana/spl-token-registry';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';

export const environment = {
  production: true,
  solanaDapp: {
    accountConfig: {
      isEnabled: true,
    },
    balanceConfig: {
      isEnabled: true,
    },
    connectionConfig: {
      isEnabled: true,
    },
    marketConfig: {
      isEnabled: true,
    },
    walletConfig: {
      isEnabled: true,
      wallets: [getPhantomWallet(), getSolletWallet(), getSolongWallet()],
      defaultWallet: DEFAULT_WALLET,
    },
    mintTokens: [
      {
        label: 'Serum',
        address: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
        pubkey: new PublicKey('SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'),
      },
      {
        label: 'Solana',
        address: NATIVE_MINT.toBase58(),
        pubkey: NATIVE_MINT,
      },
      {
        label: 'Kin',
        address: 'kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6',
        pubkey: new PublicKey('kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6'),
      },
      {
        label: 'USDC',
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        pubkey: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
      },
      {
        label: 'Raydium',
        address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
        pubkey: new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'),
      },
      {
        label: 'Solfarm',
        address: 'TuLipcqtGVXP9XR62wM8WWCm6a9vhLs7T1uoWBk6FDs',
        pubkey: new PublicKey('TuLipcqtGVXP9XR62wM8WWCm6a9vhLs7T1uoWBk6FDs'),
      },
    ],
    endpoints: [
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
    ],
    defaultEndpoint: DEFAULT_ENDPOINT,
  },
};
