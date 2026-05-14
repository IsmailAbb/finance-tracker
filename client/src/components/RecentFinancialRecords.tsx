import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useTransactions, useCategories } from "../hooks/useResources";
import { useAuth } from "../auth/AuthContext";
import { formatCurrency } from "../utils/format";
import Modal from "./Modal";
import TransactionForm from "./TransactionForm";
import Skeleton from "./Skeleton";

const LIMIT = 6;

export default function RecentFinancialRecords() {
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const [open, setOpen] = useState(false);

  // Newest entered first.
  const rows = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, LIMIT),
    [transactions]
  );

  const colorById = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of categories) if (c.color) m.set(c.id, c.color);
    return m;
  }, [categories]);

  return (
    <div className="w-full h-full">
      <div className="bg-white dark:bg-gray-900 relative shadow-sm sm:rounded-lg overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="text-lg font-medium dark:text-gray-100">Recent Transactions</div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 text-white bg-vivid-turquoise hover:bg-turquoise font-medium rounded-lg text-sm px-3 py-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Account</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-200 dark:border-gray-800 last:border-0">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    No transactions yet — add your first one!
                  </td>
                </tr>
              ) : (
                rows.map((t) => {
                  const isExpense = t.category?.type === "expense";
                  const color = t.category ? colorById.get(t.category.id) : undefined;
                  return (
                    <tr key={t.id} className="border-b border-gray-200 dark:border-gray-800 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          {color && <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />}
                          <span>{t.category?.name ?? "Uncategorized"}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${isExpense ? "text-loss-red" : "text-green-600"}`}>
                        {isExpense ? "-" : "+"}{formatCurrency(t.amount, currency)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {format(new Date(t.date), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{t.account?.name ?? "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Transaction">
        <TransactionForm onDone={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
