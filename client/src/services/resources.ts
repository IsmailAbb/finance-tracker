import { api } from "./api";
import type { Account, Category, CategoryType, Transaction } from "../types";

// ─── Transactions ─────────────────────────────────────────────
export const listTransactions = () =>
  api.get<Transaction[]>("/transactions").then((r) => r.data);

export type TransactionInput = {
  amount: number;
  date: string;
  description?: string | null;
  accountId: number;
  categoryId?: number | null;
};

export const createTransaction = (data: TransactionInput) =>
  api.post<Transaction>("/transactions", data).then((r) => r.data);

export const updateTransaction = (id: number, data: Partial<TransactionInput>) =>
  api.put<Transaction>(`/transactions/${id}`, data).then((r) => r.data);

export const deleteTransaction = (id: number) =>
  api.delete(`/transactions/${id}`).then((r) => r.data);

// ─── Accounts ─────────────────────────────────────────────────
export const listAccounts = () => api.get<Account[]>("/accounts").then((r) => r.data);

export const createAccount = (data: { name: string; initialBalance?: number }) =>
  api.post<Account>("/accounts", data).then((r) => r.data);

export const updateAccount = (id: number, data: { name?: string; initialBalance?: number }) =>
  api.put<Account>(`/accounts/${id}`, data).then((r) => r.data);

export const deleteAccount = (id: number) =>
  api.delete(`/accounts/${id}`).then((r) => r.data);

// ─── Categories ───────────────────────────────────────────────
export const listCategories = () => api.get<Category[]>("/categories").then((r) => r.data);

export const createCategory = (data: { name: string; type: CategoryType; color?: string | null }) =>
  api.post<Category>("/categories", data).then((r) => r.data);

export const updateCategory = (
  id: number,
  data: { name?: string; type?: CategoryType; color?: string | null }
) => api.put<Category>(`/categories/${id}`, data).then((r) => r.data);

export const deleteCategory = (id: number) =>
  api.delete(`/categories/${id}`).then((r) => r.data);
