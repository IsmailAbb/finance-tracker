import { useMemo, useState } from "react";
import {
  PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useTransactions, useCategories } from "../hooks/useResources";
import Skeleton from "./Skeleton";
import { categoryBreakdown } from "../utils/analytics";
import { formatCurrency } from "../utils/format";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import YearSelect from "./YearSelect";
import { FALLBACK_COLOR } from "../constants/colors";
import { parseISO } from "date-fns";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Full Year"] as const;
type MonthChoice = typeof MONTHS[number];
type Filter = "Expenses" | "Income" | "All";

export default function CategoryPieChart() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const currency = user?.currency || "USD";
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();

  const isDark = theme === "dark";
  const tooltipBg = isDark ? "#111827" : "#ffffff";
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb";
  const tooltipText = isDark ? "#f3f4f6" : "#111827";
  const legendColor = isDark ? "#d1d5db" : "#6b7280";

  const [month, setMonth] = useState<MonthChoice>("Full Year");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [filter, setFilter] = useState<Filter>("All");

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

  const data = useMemo(() => {
    const monthIdx = month === "Full Year" ? undefined : MONTHS.indexOf(month);
    const type = filter === "Expenses" ? "expense" : filter === "Income" ? "income" : "all";
    return categoryBreakdown(transactions, { year, monthIdx, type });
  }, [transactions, month, year, filter]);

  // Map category name → color (so slice colors match the Settings palette).
  const colorByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) if (c.color) m.set(c.name, c.color);
    return m;
  }, [categories]);

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 rounded-xl p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h5 className="text-lg font-semibold mr-2 dark:text-gray-100">Summary</h5>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value as MonthChoice)}
          className="text-sm rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 px-2 py-1 focus:outline-none"
        >
          {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <YearSelect value={year} years={years} onChange={setYear} />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          className="text-sm rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 px-2 py-1 focus:outline-none"
        >
          <option value="All">All</option>
          <option value="Expenses">Expenses</option>
          <option value="Income">Income</option>
        </select>
      </div>

      <div className="w-full h-[260px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Skeleton className="w-44 h-44 rounded-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
            No transactions in this range
          </div>
        ) : (
          <ResponsiveContainer key={`${month}-${year}-${filter}`} width="100%" height="100%">
            <RePieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={55}
                paddingAngle={2}
              >
                {data.map((slice, i) => (
                  <Cell key={i} fill={colorByName.get(slice.name) ?? FALLBACK_COLOR} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value ?? 0), currency)}
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${tooltipBorder}`,
                  background: tooltipBg,
                  color: tooltipText,
                }}
                itemStyle={{ color: tooltipText }}
                labelStyle={{ color: tooltipText }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: 12, color: legendColor }}
              />
            </RePieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
