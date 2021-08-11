import { Transaction as Web3Transaction } from '@solana/web3.js';

export interface Transaction {
  id: string;
  data: Web3Transaction;
}

export interface TransactionResponse {
  id: string;
  txId: string;
}
