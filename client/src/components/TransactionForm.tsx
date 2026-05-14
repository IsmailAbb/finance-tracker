import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAccounts, useCategories, useCreateTransaction, useUpdateTransaction } from "../hooks/useResources";
import type { Transaction } from "../types";

type Props = {
  initial?: Transaction | null;
  onDone: () => void;
};

const LAST_ACCOUNT_KEY = "ft_last_account";
const LAST_CATEGORY_KEY = "ft_last_category";

function readLastUsed(key: string): number | null {
  try {
    const v = localStorage.getItem(key);
    if (!v) return null;
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function writeLastUsed(key: string, value: number) {
  try { localStorage.setItem(key, String(value)); } catch { /* ignore */ }
}

export default function TransactionForm({ initial, onDone }: Props) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const create = useCreateTransaction();
  const update = useUpdateTransaction();

  const [amount, setAmount] = useState<string>(initial ? String(initial.amount) : "");
  const [date, setDate] = useState<string>(
    initial ? format(new Date(initial.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  );
  const [accountId, setAccountId] = useState<number | "">(initial?.accountId ?? "");
  const [categoryId, setCategoryId] = useState<number | "">(initial?.categoryId ?? "");
  const [description, setDescription] = useState<string>(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  // Default account/category for a *new* transaction: prefer the user's last-used,
  // else fall back to the first available.
  useEffect(() => {
    if (initial) return;
    if (accountId === "" && accounts.length > 0) {
      const last = readLastUsed(LAST_ACCOUNT_KEY);
      const found = last && accounts.find((a) => a.id === last);
      setAccountId(found ? found.id : accounts[0]!.id);
    }
    if (categoryId === "" && categories.length > 0) {
      const last = readLastUsed(LAST_CATEGORY_KEY);
      const found = last && categories.find((c) => c.id === last);
      setCategoryId(found ? found.id : categories[0]!.id);
    }
  }, [accounts, categories, initial, accountId, categoryId]);

  const submitting = create.isPending || update.isPending;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    if (!amount.trim() || !Number.isFinite(amt) || amt <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (!date) {
      setError("Pick a date");
      return;
    }
    if (accountId === "") {
      setError("Pick an account");
      return;
    }
    // Anchor the date at 12:00 UTC so every timezone agrees on which calendar day it is.
    // (Sending 00:00 local can shift the date by ±1 day in other timezones.)
    const payload = {
      amount: amt,
      date: `${date}T12:00:00.000Z`,
      description: description || null,
      accountId: Number(accountId),
      categoryId: categoryId === "" ? null : Number(categoryId),
    };
    try {
      if (initial) {
        await update.mutateAsync({ id: initial.id, data: payload });
        toast.success("Transaction updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Transaction added");
      }
      writeLastUsed(LAST_ACCOUNT_KEY, payload.accountId);
      if (payload.categoryId) writeLastUsed(LAST_CATEGORY_KEY, payload.categoryId);
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Amount</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Account</label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value ? Number(e.target.value) : "")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          <option value="">— None —</option>
          <optgroup label="Income">
            {categories.filter((c) => c.type === "income").map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </optgroup>
          <optgroup label="Expense">
            {categories.filter((c) => c.type === "expense").map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </optgroup>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200"
          placeholder="Optional"
        />
      </div>
      {error && <p className="text-loss-red text-sm">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-vivid-turquoise text-white hover:bg-turquoise disabled:opacity-60"
        >
          {submitting ? "Saving…" : initial ? "Update" : "Add"}
        </button>
      </div>
    </form>
  );
}
