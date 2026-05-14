import { describe, expect, it } from "vitest";
import {
  percentChange, rangeFor, previousRangeFor, totalsInRange, totalsAllTime,
  monthlyTotalsForYear, categoryBreakdown,
} from "./analytics";
import type { Transaction } from "../types";

function tx(partial: Partial<Transaction> & { amount: number; date: string }): Transaction {
  return {
    id: Math.floor(Math.random() * 1e9),
    description: null,
    accountId: 1,
    categoryId: null,
    userId: 1,
    createdAt: partial.date,
    account: { id: 1, name: "Cash" },
    category: partial.category ?? null,
    ...partial,
  } as Transaction;
}

describe("percentChange", () => {
  it("returns null when no prior data", () => {
    expect(percentChange(100, 0)).toBeNull();
    expect(percentChange(0, 0)).toBeNull();
  });

  it("computes percentage growth", () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(50, 100)).toBe(-50);
  });

  it("uses absolute prev so a positive change against a negative prev is positive", () => {
    // prev -100, current -50 → improved by 50 (less negative)
    expect(percentChange(-50, -100)).toBe(50);
  });
});

describe("range helpers", () => {
  it("rangeFor 'Day' returns same calendar day", () => {
    const now = new Date(2026, 4, 14, 15, 30); // May 14 2026 15:30 local
    const r = rangeFor("Day", 0, now);
    expect(r.start.getDate()).toBe(14);
    expect(r.end.getDate()).toBe(14);
    expect(r.start.getHours()).toBe(0);
  });

  it("rangeFor 'Week' respects weekStartsOn", () => {
    const wed = new Date(2026, 4, 13); // a Wednesday
    const sun = rangeFor("Week", 0, wed); // week starts Sunday
    const mon = rangeFor("Week", 1, wed); // week starts Monday
    expect(sun.start.getDay()).toBe(0);
    expect(mon.start.getDay()).toBe(1);
  });

  it("previousRangeFor 'Month' is the prior calendar month", () => {
    const now = new Date(2026, 4, 14); // May
    const prev = previousRangeFor("Month", 0, now);
    expect(prev.start.getMonth()).toBe(3); // April
  });
});

describe("totals", () => {
  const txs: Transaction[] = [
    tx({ amount: 100, date: "2026-05-10T12:00:00Z", category: { id: 1, name: "Salary", type: "income" } }),
    tx({ amount: 30, date: "2026-05-11T12:00:00Z", category: { id: 2, name: "Food", type: "expense" } }),
    tx({ amount: 20, date: "2026-04-30T12:00:00Z", category: { id: 2, name: "Food", type: "expense" } }),
    tx({ amount: 5, date: "2026-05-12T12:00:00Z", category: null }), // uncategorized — ignored
  ];

  it("totalsAllTime computes net = income - expense", () => {
    const t = totalsAllTime(txs);
    expect(t.income).toBe(100);
    expect(t.expense).toBe(50);
    expect(t.net).toBe(50);
  });

  it("totalsInRange only counts transactions in the range", () => {
    const may = rangeFor("Month", 0, new Date(2026, 4, 15));
    const t = totalsInRange(txs, may);
    expect(t.income).toBe(100);
    expect(t.expense).toBe(30);
  });
});

describe("monthlyTotalsForYear", () => {
  const txs: Transaction[] = [
    tx({ amount: 100, date: "2026-01-15T12:00:00Z", category: { id: 1, name: "Salary", type: "income" } }),
    tx({ amount: 200, date: "2026-02-15T12:00:00Z", category: { id: 1, name: "Salary", type: "income" } }),
    tx({ amount: 50, date: "2026-02-20T12:00:00Z", category: { id: 2, name: "Food", type: "expense" } }),
    tx({ amount: 999, date: "2025-12-01T12:00:00Z", category: { id: 1, name: "Salary", type: "income" } }),
  ];

  it("buckets income by month", () => {
    const data = monthlyTotalsForYear(txs, 2026, "income");
    expect(data[0]!.value).toBe(100);
    expect(data[1]!.value).toBe(200);
    expect(data[2]!.value).toBe(0);
  });

  it("profit subtracts expenses", () => {
    const data = monthlyTotalsForYear(txs, 2026, "profit");
    expect(data[1]!.value).toBe(150); // 200 - 50
  });

  it("ignores transactions outside the year", () => {
    const total = monthlyTotalsForYear(txs, 2026, "income").reduce((s, m) => s + m.value, 0);
    expect(total).toBe(300); // 999 from 2025 not counted
  });
});

describe("categoryBreakdown", () => {
  const txs: Transaction[] = [
    tx({ amount: 50, date: "2026-05-10T12:00:00Z", category: { id: 1, name: "Food", type: "expense" } }),
    tx({ amount: 30, date: "2026-05-12T12:00:00Z", category: { id: 1, name: "Food", type: "expense" } }),
    tx({ amount: 100, date: "2026-05-15T12:00:00Z", category: { id: 2, name: "Rent", type: "expense" } }),
  ];

  it("sums per category and sorts descending", () => {
    const data = categoryBreakdown(txs, { year: 2026, monthIdx: 4, type: "expense" });
    expect(data).toEqual([
      { name: "Rent", value: 100 },
      { name: "Food", value: 80 },
    ]);
  });

  it("filters by month", () => {
    const data = categoryBreakdown(txs, { year: 2026, monthIdx: 3, type: "expense" });
    expect(data).toEqual([]);
  });
});
