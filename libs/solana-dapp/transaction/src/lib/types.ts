import { Connection, Transaction as Web3Transaction } from '@solana/web3.js';

export interface Transaction {
  id: string;
  data: Web3Transaction;
}

export interface TransferConfig {
  connection: string | Connection;
  walletAddress: string;
  recipientAddress: string;
  amount: number;
}
