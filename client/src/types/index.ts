export type CategoryType = "income" | "expense";

export interface User {
  id: number;
  email: string;
  name: string | null;
  currency: string;
  timezone: string;
  /** 0 = Sunday, 1 = Monday, …, 6 = Saturday */
  weekStartsOn: number;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  color: string | null;
  userId: number;
}

export interface Account {
  id: number;
  name: string;
  initialBalance: number;
  currentBalance: number;
  userId: number;
}

export interface Transaction {
  id: number;
  amount: number;
  date: string;
  description: string | null;
  accountId: number;
  categoryId: number | null;
  userId: number;
  createdAt: string;
  account?: { id: number; name: string };
  category?: { id: number; name: string; type: CategoryType } | null;
}
