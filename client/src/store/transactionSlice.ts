import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface Transaction {
    id: number;
    amount: number;
    date: string;
    description: string;
    category: { name: string; type: string } | null;
}

interface TransactionState {
    transactions: Transaction[];
}

const initialState: TransactionState = { transactions: [] };

const transactionSlice = createSlice({
    name: "transactions",
    initialState,
    reducers: {
        setTransactions: (state, action: PayloadAction<Transaction[]>) => {
            state.transactions = action.payload;
        },
        addTransaction: (state, action: PayloadAction<Transaction>) => {
            state.transactions.unshift(action.payload);
        },
        deleteTransaction: (state, action: PayloadAction<number>) => {
            state.transactions = state.transactions.filter(tx => tx.id !== action.payload);
        },
    },
});

export const { setTransactions, addTransaction, deleteTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
