import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listTransactions, createTransaction, updateTransaction, deleteTransaction,
  type TransactionInput,
  listAccounts, createAccount, updateAccount, deleteAccount,
  listCategories, createCategory, updateCategory, deleteCategory,
} from "../services/resources";
import type { CategoryType } from "../types";

export const keys = {
  transactions: ["transactions"] as const,
  accounts: ["accounts"] as const,
  categories: ["categories"] as const,
};

// ─── Transactions ─────────────────────────────────────────────
export const useTransactions = () =>
  useQuery({ queryKey: keys.transactions, queryFn: listTransactions });

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionInput) => createTransaction(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.transactions });
      qc.invalidateQueries({ queryKey: keys.accounts });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TransactionInput> }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.transactions });
      qc.invalidateQueries({ queryKey: keys.accounts });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.transactions });
      qc.invalidateQueries({ queryKey: keys.accounts });
    },
  });
}

// ─── Accounts ─────────────────────────────────────────────────
export const useAccounts = () =>
  useQuery({ queryKey: keys.accounts, queryFn: listAccounts });

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; initialBalance?: number }) => createAccount(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.accounts }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; initialBalance?: number } }) =>
      updateAccount(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.accounts }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.accounts });
      qc.invalidateQueries({ queryKey: keys.transactions });
    },
  });
}

// ─── Categories ───────────────────────────────────────────────
export const useCategories = () =>
  useQuery({ queryKey: keys.categories, queryFn: listCategories });

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; type: CategoryType; color?: string | null }) => createCategory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.categories }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, data,
    }: { id: number; data: { name?: string; type?: CategoryType; color?: string | null } }) =>
      updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.categories }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.categories });
      qc.invalidateQueries({ queryKey: keys.transactions });
    },
  });
}
