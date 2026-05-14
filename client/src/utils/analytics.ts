import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  subDays, subWeeks, subMonths, subYears,
  isWithinInterval, parseISO,
  format,
} from "date-fns";
import type { Transaction } from "../types";

export type Period = "Day" | "Week" | "Month" | "Year";
export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type Range = { start: Date; end: Date };

export function rangeFor(period: Period, weekStartsOn: WeekStart = 0, now: Date = new Date()): Range {
  switch (period) {
    case "Day":   return { start: startOfDay(now),  end: endOfDay(now) };
    case "Week":  return { start: startOfWeek(now, { weekStartsOn }), end: endOfWeek(now, { weekStartsOn }) };
    case "Month": return { start: startOfMonth(now), end: endOfMonth(now) };
    case "Year":  return { start: startOfYear(now),  end: endOfYear(now) };
  }
}

export function previousRangeFor(period: Period, weekStartsOn: WeekStart = 0, now: Date = new Date()): Range {
  const prev =
    period === "Day"   ? subDays(now, 1) :
    period === "Week"  ? subWeeks(now, 1) :
    period === "Month" ? subMonths(now, 1) :
                         subYears(now, 1);
  return rangeFor(period, weekStartsOn, prev);
}

export type Totals = { income: number; expense: number; net: number };

export function totalsInRange(transactions: Transaction[], range: Range): Totals {
  return transactions.reduce<Totals>(
    (acc, t) => {
      const d = parseISO(t.date);
      if (!isWithinInterval(d, range)) return acc;
      if (t.category?.type === "income") acc.income += t.amount;
      else if (t.category?.type === "expense") acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0, net: 0 }
  );
}

export function totalsAllTime(transactions: Transaction[]): Totals {
  const t = transactions.reduce<Totals>(
    (acc, tx) => {
      if (tx.category?.type === "income") acc.income += tx.amount;
      else if (tx.category?.type === "expense") acc.expense += tx.amount;
      return acc;
    },
    { income: 0, expense: 0, net: 0 }
  );
  t.net = t.income - t.expense;
  return t;
}

/**
 * % change vs previous period. Returns `null` when there's no prior data to compare
 * against (avoids the misleading "+100%" on the very first period of activity).
 */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/** Group transactions of a given type by calendar month for the given year. */
export function monthlyTotalsForYear(
  transactions: Transaction[],
  year: number,
  type: "income" | "expense" | "profit"
): { name: string; value: number }[] {
  const months = Array.from({ length: 12 }, (_, i) => ({
    name: format(new Date(year, i, 1), "MMM"),
    monthIdx: i,
    value: 0,
  }));
  for (const t of transactions) {
    const d = parseISO(t.date);
    if (d.getFullYear() !== year) continue;
    const monthIdx = d.getMonth();
    const ttype = t.category?.type;
    const bucket = months[monthIdx];
    if (!bucket) continue;
    if (type === "income" && ttype === "income") bucket.value += t.amount;
    else if (type === "expense" && ttype === "expense") bucket.value += t.amount;
    else if (type === "profit") {
      if (ttype === "income") bucket.value += t.amount;
      else if (ttype === "expense") bucket.value -= t.amount;
    }
  }
  return months.map((m) => ({ name: m.name, value: Math.round(m.value * 100) / 100 }));
}

/** Sum by category, optionally filtered by month/year/type. */
export function categoryBreakdown(
  transactions: Transaction[],
  opts: { year?: number; monthIdx?: number; type: "income" | "expense" | "all" }
): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    const d = parseISO(t.date);
    if (opts.year !== undefined && d.getFullYear() !== opts.year) continue;
    if (opts.monthIdx !== undefined && d.getMonth() !== opts.monthIdx) continue;
    const ttype = t.category?.type;
    if (opts.type !== "all" && ttype !== opts.type) continue;
    if (!ttype) continue;
    const name = t.category?.name ?? "Uncategorized";
    map.set(name, (map.get(name) || 0) + t.amount);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);
}
