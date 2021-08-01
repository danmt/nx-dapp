import {
  getPhantomWallet,
  getSolletWallet,
  getSolongWallet,
} from '@nx-dapp/solana-dapp/wallet/wallets';
import { NATIVE_MINT } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

export const environment = {
  production: true,
  solanaDapp: {
    isAccountEnabled: true,
    isBalanceEnabled: true,
    isConnectionEnabled: true,
    isMarketEnabled: true,
    isWalletEnabled: true,
    wallets: [getPhantomWallet(), getSolletWallet(), getSolongWallet()],
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
  },
};
