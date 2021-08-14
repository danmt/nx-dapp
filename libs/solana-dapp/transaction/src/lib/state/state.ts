import {
  ExtendedTransaction,
  Transaction,
  TransactionResponse,
} from '@nx-dapp/solana-dapp/utils/types';

export interface Action {
  type: string;
  payload?: unknown;
}

export interface TransactionState {
  transactions: ExtendedTransaction[];
  isProcessing: boolean;
  inProcess: number;
}

export const transactionInitialState: TransactionState = {
  transactions: [],
  isProcessing: false,
  inProcess: 0,
};

export const reducer = (state: TransactionState, action: Action) => {
  switch (action.type) {
    case 'splTransferCreated':
    case 'nativeTransferCreated':
      return {
        ...state,
        transactions: [
          ...state.transactions,
          {
            ...(action.payload as Transaction),
            status: 'Signing',
            isProcessing: true,
          },
        ],
        isProcessing: true,
        inProcess: state.inProcess + 1,
      };
    case 'sendTransaction':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === (action.payload as Transaction).id
            ? { ...transaction, status: 'Sending', isProcessing: true }
            : transaction
        ),
      };
    case 'confirmTransaction':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === (action.payload as TransactionResponse).id
            ? {
                ...transaction,
                status: 'Confirming',
                txId: (action.payload as TransactionResponse).txId,
                isProcessing: true,
              }
            : transaction
        ),
      };
    case 'transactionConfirmed':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload
            ? { ...transaction, status: 'Confirmed', isProcessing: false }
            : transaction
        ),
        inProcess: state.inProcess - 1,
        isProcessing: state.inProcess - 1 > 0,
      };
    case 'cancelTransaction':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload
            ? { ...transaction, status: 'Cancelled', isProcessing: false }
            : transaction
        ),
        inProcess: state.inProcess - 1,
        isProcessing: state.inProcess - 1 > 0,
      };
    case 'setNetwork':
    case 'reset':
      return { ...transactionInitialState };
    default:
      return state;
  }
};
