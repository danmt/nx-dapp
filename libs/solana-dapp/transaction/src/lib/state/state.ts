import {
  ExtendedTransaction,
  Transaction,
  TransactionResponse,
} from '@nx-dapp/solana-dapp/transaction';

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
    case 'transactionCreated':
      return {
        ...state,
        transactions: [
          ...state.transactions,
          {
            ...(action.payload as Transaction),
            status: 'Pending Sign',
          },
        ],
        isProcessing: true,
        inProcess: state.inProcess + 1,
      };
    case 'transactionSigned':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === (action.payload as Transaction).id
            ? { ...transaction, status: 'Pending Send' }
            : transaction
        ),
      };
    case 'transactionSent':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === (action.payload as TransactionResponse).id
            ? {
                ...transaction,
                status: 'Pending Confirmation',
                txId: (action.payload as TransactionResponse).txId,
              }
            : transaction
        ),
      };
    case 'transactionConfirmed':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === (action.payload as Transaction).id
            ? { ...transaction, status: 'Confirmed' }
            : transaction
        ),
        inProcess: state.inProcess - 1,
        isProcessing: state.inProcess - 1 > 0,
      };
    default:
      return state;
  }
};
