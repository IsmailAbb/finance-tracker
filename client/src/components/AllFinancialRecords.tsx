import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useTransactions, useDeleteTransaction, useCategories } from "../hooks/useResources";
import { useAuth } from "../auth/AuthContext";
import { formatCurrency } from "../utils/format";
import Modal from "./Modal";
import TransactionForm from "./TransactionForm";
import { useConfirm } from "./ConfirmDialog";
import YearSelect from "./YearSelect";
import Skeleton from "./Skeleton";
import type { Transaction } from "../types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
type MonthChoice = "Any Month" | typeof MONTHS[number];
type Filter = "All" | "Income" | "Expenses";

type SortKey = "category" | "amount" | "date" | "account" | "description" | "createdAt";
type SortDir = "asc" | "desc";
type YearChoice = number | "Any";

const filterSelectCls =
  "w-32 text-sm rounded-lg border border-gray-300 bg-white px-3 py-1.5 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none";

export default function AllFinancialRecords() {
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();
  const del = useDeleteTransaction();
  const confirm = useConfirm();

  const [month, setMonth] = useState<MonthChoice>("Any Month");
  const [year, setYear] = useState<YearChoice>(new Date().getFullYear());
  const [filter, setFilter] = useState<Filter>("All");
  const [categoryId, setCategoryId] = useState<"All" | number>("All");

  // Default sort: createdAt desc (newest entered first). User-clicked sort overrides.
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "createdAt", dir: "desc" });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  // Years: from earliest transaction year through current year (descending).
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    let earliest = current;
    for (const t of transactions) {
      const y = parseISO(t.date).getFullYear();
      if (y < earliest) earliest = y;
    }
    const out: number[] = [];
    for (let y = current; y >= earliest; y--) out.push(y);
    return out.length > 0 ? out : [current];
  }, [transactions]);

  const filtered = useMemo(() => {
    const list = transactions.filter((t) => {
      const d = parseISO(t.date);
      if (year !== "Any" && d.getFullYear() !== year) return false;
      if (month !== "Any Month" && d.getMonth() !== MONTHS.indexOf(month)) return false;
      if (filter === "Income" && t.category?.type !== "income") return false;
      if (filter === "Expenses" && t.category?.type !== "expense") return false;
      if (categoryId !== "All" && t.categoryId !== categoryId) return false;
      return true;
    });

    const dir = sort.dir === "asc" ? 1 : -1;
    const cmp = (a: Transaction, b: Transaction) => {
      switch (sort.key) {
        case "amount":      return (a.amount - b.amount) * dir;
        case "date":        return (parseISO(a.date).getTime() - parseISO(b.date).getTime()) * dir;
        case "account":     return (a.account?.name ?? "").localeCompare(b.account?.name ?? "") * dir;
        case "category":    return (a.category?.name ?? "").localeCompare(b.category?.name ?? "") * dir;
        case "description": return (a.description ?? "").localeCompare(b.description ?? "") * dir;
        case "createdAt":
        default:            return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      }
    };
    return [...list].sort(cmp);
  }, [transactions, year, month, filter, categoryId, sort]);

  const onEdit = (t: Transaction) => { setEditing(t); setOpen(true); };
  const onAdd = () => { setEditing(null); setOpen(true); };
  const onDelete = async (t: Transaction) => {
    const ok = await confirm({
      title: "Delete transaction?",
      message: <>Delete this {t.category?.name ?? "transaction"} for {formatCurrency(t.amount, currency)}?</>,
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await del.mutateAsync(t.id);
      toast.success("Transaction deleted");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete");
    }
  };

  const toggleSort = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  return (
    <div className="w-full h-full">
      <div className="bg-white dark:bg-gray-900 relative shadow-sm sm:rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-3 p-4">
          <div className="text-lg font-medium dark:text-gray-100">Transactions</div>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value as MonthChoice)}
              className={filterSelectCls}
            >
              <option value="Any Month">Any Month</option>
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <YearSelect<YearChoice>
              value={year}
              years={years}
              onChange={setYear}
              anyOption={{ value: "Any", label: "Any Year" }}
              className="w-32"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className={filterSelectCls}
            >
              <option value="All">All</option>
              <option value="Income">Income</option>
              <option value="Expenses">Expenses</option>
            </select>
            <select
              value={categoryId === "All" ? "All" : String(categoryId)}
              onChange={(e) => setCategoryId(e.target.value === "All" ? "All" : Number(e.target.value))}
              className={filterSelectCls}
            >
              <option value="All">All Categories</option>
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
            <button
              onClick={onAdd}
              className="flex items-center gap-1 text-white bg-vivid-turquoise hover:bg-turquoise rounded-lg text-sm px-3 py-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <tr>
                <SortableTh sort={sort} colKey="category" onClick={toggleSort}>Category</SortableTh>
                <SortableTh sort={sort} colKey="amount" onClick={toggleSort}>Amount</SortableTh>
                <SortableTh sort={sort} colKey="date" onClick={toggleSort}>Date</SortableTh>
                <SortableTh sort={sort} colKey="account" onClick={toggleSort}>Account</SortableTh>
                <SortableTh sort={sort} colKey="description" onClick={toggleSort}>Description</SortableTh>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-200 dark:border-gray-800 last:border-0">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full max-w-[7rem]" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    No transactions fit the criteria
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isExpense = t.category?.type === "expense";
                  return (
                    <tr key={t.id} className="border-b border-gray-200 dark:border-gray-800 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          {t.category?.id ? (
                            <CategoryDot category={t.category} categories={categories} />
                          ) : null}
                          <span>{t.category?.name ?? "Uncategorized"}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${isExpense ? "text-loss-red" : "text-green-600"}`}>
                        {isExpense ? "-" : "+"}{formatCurrency(t.amount, currency)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {format(parseISO(t.date), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{t.account?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{t.description || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => onEdit(t)}
                            className="text-gray-500 hover:text-vivid-turquoise"
                            aria-label="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(t)}
                            className="text-gray-500 hover:text-loss-red"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={
          editing
            ? `Edit transaction — ${formatCurrency(editing.amount, currency)} on ${format(
                parseISO(editing.date),
                "MMM d, yyyy"
              )}`
            : "Add Transaction"
        }
      >
        <TransactionForm initial={editing} onDone={() => setOpen(false)} />
      </Modal>
    </div>
  );
}

function SortableTh({
  children, sort, colKey, onClick,
}: {
  children: React.ReactNode;
  sort: { key: SortKey; dir: SortDir };
  colKey: SortKey;
  onClick: (k: SortKey) => void;
}) {
  const active = sort.key === colKey;
  return (
    <th
      onClick={() => onClick(colKey)}
      className="px-4 py-3 select-none cursor-pointer group"
      title="Click to sort"
    >
      {/*
        The trick to prevent hover-shift: render the bold version invisibly above with
        the same content so the cell width is always sized for bold. The visible label
        is regular weight by default and only "appears" bold on hover.
      */}
      <span className="relative inline-flex items-center gap-1">
        <span className="invisible font-bold underline whitespace-nowrap">{children}</span>
        <span className="absolute left-0 inset-y-0 inline-flex items-center group-hover:font-bold group-hover:underline transition">
          {children}
        </span>
        {active && (sort.dir === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
      </span>
    </th>
  );
}

function CategoryDot({
  category, categories,
}: {
  category: NonNullable<Transaction["category"]>;
  categories: { id: number; color: string | null }[];
}) {
  const color = categories.find((c) => c.id === category.id)?.color;
  if (!color) return null;
  return <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />;
}
