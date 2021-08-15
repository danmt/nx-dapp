import { Transaction as Web3Transaction } from '@solana/web3.js';

export interface TransactionResponse {
  id: string;
  txId: string;
}

export interface Transaction {
  status: string;
  txId?: string;
  isProcessing: boolean;
  id: string;
  date: Date;
  data?: Web3Transaction;
}

export interface CreateNativeTransferPayload {
  id: string;
  date: Date;
  recipientAddress: string;
  amount: number;
}

export interface CreateSplTransferPayload {
  id: string;
  date: Date;
  emitterAddress: string;
  recipientAddress: string;
  mintAddress: string;
  amount: number;
  decimals: number;
}

export interface TransactionPayload {
  id: string;
  data: Web3Transaction;
}
