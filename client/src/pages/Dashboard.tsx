import { useEffect, useMemo, useRef, useState } from "react";
import { Wallet, TrendingUp, TrendingDown, LogOut, CircleUserRound } from "lucide-react";
import BarChart from "../components/BarChart";
import PieChart from "../components/PieChart";
import RecentFinancialRecords from "../components/RecentFinancialRecords";
import AllFinancialRecords from "../components/AllFinancialRecords";
import Settings from "../components/Settings";
import StatCard from "../components/StatCard";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../auth/AuthContext";
import { useTransactions } from "../hooks/useResources";
import {
  percentChange, previousRangeFor, rangeFor, totalsAllTime, totalsInRange,
  type Period, type WeekStart,
} from "../utils/analytics";

const TABS = ["Overview", "Transactions", "Settings"] as const;
type Tab = (typeof TABS)[number];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const currency = user?.currency || "USD";
  const weekStartsOn = (user?.weekStartsOn ?? 0) as WeekStart;
  const { data: transactions = [] } = useTransactions();

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<Array<HTMLButtonElement | null>>(Array(TABS.length).fill(null));

  const [balancePeriod, setBalancePeriod] = useState<Period>("Month");
  const [incomePeriod, setIncomePeriod] = useState<Period>("Month");
  const [expensePeriod, setExpensePeriod] = useState<Period>("Month");

  // ─── Balance card: net worth as of "today", with delta vs end of previous period ─
  const allTime = useMemo(() => totalsAllTime(transactions), [transactions]);
  const netNow = allTime.income - allTime.expense;

  const balanceMetrics = useMemo(() => {
    const curRange = rangeFor(balancePeriod, weekStartsOn);
    const prevRange = previousRangeFor(balancePeriod, weekStartsOn);
    const cur = totalsInRange(transactions, curRange);
    const prev = totalsInRange(transactions, prevRange);
    const curNet = cur.income - cur.expense;
    const prevNet = prev.income - prev.expense;
    return { current: netNow, delta: curNet - prevNet, pct: percentChange(curNet, prevNet) };
  }, [transactions, balancePeriod, netNow, weekStartsOn]);

  // ─── Income card ─────────────────────────────────────────────
  const incomeMetrics = useMemo(() => {
    const cur = totalsInRange(transactions, rangeFor(incomePeriod, weekStartsOn));
    const prev = totalsInRange(transactions, previousRangeFor(incomePeriod, weekStartsOn));
    return { current: cur.income, delta: cur.income - prev.income, pct: percentChange(cur.income, prev.income) };
  }, [transactions, incomePeriod, weekStartsOn]);

  // ─── Expense card ────────────────────────────────────────────
  const expenseMetrics = useMemo(() => {
    const cur = totalsInRange(transactions, rangeFor(expensePeriod, weekStartsOn));
    const prev = totalsInRange(transactions, previousRangeFor(expensePeriod, weekStartsOn));
    return { current: cur.expense, delta: cur.expense - prev.expense, pct: percentChange(cur.expense, prev.expense) };
  }, [transactions, expensePeriod, weekStartsOn]);

  useEffect(() => {
    const reposition = () => {
      const i = TABS.indexOf(activeTab);
      const el = tabRefs.current[i];
      if (el) setUnderlineStyle({ left: el.offsetLeft, width: el.offsetWidth });
    };
    reposition();
    window.addEventListener("resize", reposition);
    return () => window.removeEventListener("resize", reposition);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      {/* ─── Top bar ─── */}
      <header className="w-full mb-8">
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <Logo />
          <div className="flex items-center gap-3">
            <CircleUserRound className="w-10 h-10 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
            <div className="flex flex-col leading-tight">
              <span className="font-medium dark:text-gray-100">{user?.name || "—"}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</span>
            </div>
            <ThemeToggle />
            <button
              onClick={signOut}
              className="p-2 text-gray-500 hover:text-loss-red hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="w-full border-b border-gray-200 dark:border-gray-800 mt-2" />
      </header>

      {/* ─── Tabs ─── */}
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-3xl font-semibold dark:text-gray-100">Finance Report</h1>
        <div className="relative flex gap-6">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              ref={(el) => { tabRefs.current[i] = el; }}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-lg font-medium transition-colors ${
                activeTab === tab
                  ? "text-vivid-turquoise"
                  : "text-black dark:text-gray-300 hover:text-vivid-turquoise"
              }`}
            >
              {tab}
            </button>
          ))}
          <span
            className="absolute bottom-0 h-0.5 bg-vivid-turquoise transition-all duration-300"
            style={{ left: underlineStyle.left, width: underlineStyle.width }}
          />
        </div>
      </div>

      {activeTab === "Overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="My Balance"
              icon={Wallet}
              amount={balanceMetrics.current}
              delta={balanceMetrics.delta}
              deltaPct={balanceMetrics.pct}
              period={balancePeriod}
              onPeriodChange={setBalancePeriod}
              currency={currency}
            />
            <StatCard
              title="Income"
              icon={TrendingUp}
              amount={incomeMetrics.current}
              delta={incomeMetrics.delta}
              deltaPct={incomeMetrics.pct}
              period={incomePeriod}
              onPeriodChange={setIncomePeriod}
              currency={currency}
            />
            <StatCard
              title="Expenses"
              icon={TrendingDown}
              amount={expenseMetrics.current}
              delta={expenseMetrics.delta}
              deltaPct={expenseMetrics.pct}
              period={expensePeriod}
              onPeriodChange={setExpensePeriod}
              currency={currency}
              invertColor
            />
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm relative">
            <BarChart />
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <PieChart />
            </div>
            <div className="lg:col-span-2">
              <RecentFinancialRecords />
            </div>
          </div>
        </>
      )}

      {activeTab === "Transactions" && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm">
          <AllFinancialRecords />
        </div>
      )}

      {activeTab === "Settings" && <Settings />}
    </div>
  );
}
