import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";
import { parseISO } from "date-fns";
import { useTransactions } from "../hooks/useResources";
import Skeleton from "./Skeleton";
import { monthlyTotalsForYear, percentChange } from "../utils/analytics";
import { formatCurrency, formatPercent, splitCurrency } from "../utils/format";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import YearSelect from "./YearSelect";

type Filter = "Income" | "Expenses" | "Profit";

export default function YearReviewBarChart() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const currency = user?.currency || "USD";
  const { data: transactions = [], isLoading } = useTransactions();

  const isDark = theme === "dark";
  const gridStroke = isDark ? "#374151" : "#E5E7EB";
  const tickFill = isDark ? "#9CA3AF" : "#6B7280";
  const tooltipBg = isDark ? "#111827" : "#ffffff";
  const tooltipBorder = isDark ? "#374151" : "#f3f4f6";
  const tooltipText = isDark ? "#f3f4f6" : "#111827";
  const barFill = isDark ? "#34d399" : "#188160"; // lighter green in dark mode for contrast
  const avgStroke = isDark ? "#34d399" : "#188160";

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [filter, setFilter] = useState<Filter>("Income");

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

  const type = filter === "Income" ? "income" : filter === "Expenses" ? "expense" : "profit";
  const data = useMemo(
    () => monthlyTotalsForYear(transactions, year, type),
    [transactions, year, type]
  );

  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
  const average = useMemo(() => (data.length ? total / data.length : 0), [data, total]);

  const prevYearData = useMemo(
    () => monthlyTotalsForYear(transactions, year - 1, type),
    [transactions, year, type]
  );
  const prevTotal = prevYearData.reduce((s, d) => s + d.value, 0);
  const pct = percentChange(total, prevTotal);
  const noPrior = pct === null;
  const isUp = (pct ?? 0) >= 0;
  const goodWhenUp = filter !== "Expenses";
  const pctColor = noPrior
    ? "text-gray-500 dark:text-gray-400"
    : isUp === goodWhenUp
    ? "text-green-600"
    : "text-loss-red";
  const Arrow = noPrior ? Minus : isUp ? ArrowUpRight : ArrowDownRight;

  const { whole, fraction } = splitCurrency(total, currency);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-3xl font-medium dark:text-gray-100">Year Review</h2>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-5xl font-semibold text-black dark:text-gray-100">
              {whole}<span className="text-gray-400 dark:text-gray-500">{fraction}</span>
            </p>
            <div className={`flex items-center gap-1 rounded-lg px-2 py-1 bg-grey-turquoise/50 dark:bg-gray-800 ${pctColor} translate-y-1`}>
              <span className="text-sm font-medium">{noPrior ? "—" : formatPercent(pct!)}</span>
              <Arrow className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-start">
          <YearSelect value={year} years={years} onChange={setYear} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="Income">Income</option>
            <option value="Expenses">Expenses</option>
            <option value="Profit">Profit</option>
          </select>
        </div>
      </div>

      <div className="w-full h-[250px]" tabIndex={-1}>
        {isLoading ? (
          <div className="h-full flex items-end gap-3 px-2 pt-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="flex-1" style={{ height: `${30 + ((i * 17) % 60)}%` }} />
            ))}
          </div>
        ) : (
        <ResponsiveContainer key={`${year}-${filter}`} width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 5 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="6 6" stroke={gridStroke} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: tickFill }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: tickFill }} />
            <Tooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const v = Number(payload[0]?.value ?? 0);
                return (
                  <div
                    className="rounded-md px-3 py-2 shadow-md text-sm border"
                    style={{ background: tooltipBg, borderColor: tooltipBorder, color: tooltipText }}
                  >
                    <p className="font-medium">{label}</p>
                    <p>{formatCurrency(v, currency)}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" fill={barFill} barSize={80} radius={[6, 6, 0, 0]} />
            {average > 0 && (
              <ReferenceLine
                y={average}
                stroke={avgStroke}
                strokeDasharray="5 5"
                strokeWidth={1.5}
                ifOverflow="extendDomain"
                label={{
                  value: `Avg ${formatCurrency(average, currency)}`,
                  position: "right",
                  fill: avgStroke,
                  fontSize: 11,
                }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
