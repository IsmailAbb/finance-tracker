import { ArrowUpRight, ArrowDownRight, Minus, type LucideIcon } from "lucide-react";
import { formatCurrency, splitCurrency, formatPercent } from "../utils/format";
import type { Period } from "../utils/analytics";

const PERIODS: Period[] = ["Day", "Week", "Month", "Year"];

function periodLabel(p: Period) {
  return p === "Day" ? "today" : `this ${p.toLowerCase()}`;
}
function prevPeriodLabel(p: Period) {
  return p === "Day" ? "yesterday" : `last ${p.toLowerCase()}`;
}

type Props = {
  title: string;
  icon?: LucideIcon;
  amount: number;
  delta: number;
  /** `null` means "no prior data to compare against". */
  deltaPct: number | null;
  period: Period;
  onPeriodChange: (p: Period) => void;
  currency: string;
  /** When true (e.g. expenses), an increase is bad and shown in red. */
  invertColor?: boolean;
};

export default function StatCard({
  title, icon: Icon, amount, delta, deltaPct, period, onPeriodChange, currency, invertColor,
}: Props) {
  const { whole, fraction } = splitCurrency(amount, currency);

  const noPrior = deltaPct === null;
  const goodWhenUp = !invertColor;
  const isUp = (deltaPct ?? 0) >= 0;
  const goodDirection = isUp === goodWhenUp;
  const Arrow = noPrior ? Minus : isUp ? ArrowUpRight : ArrowDownRight;

  // Neutral when there's no prior period to compare against, otherwise red/green.
  const pctColor = noPrior
    ? "text-gray-500 dark:text-gray-400"
    : goodDirection
    ? "text-green-600"
    : "text-loss-red";

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
          <div className="text-lg font-medium dark:text-gray-100">{title}</div>
        </div>
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as Period)}
          className="border rounded-lg px-2 py-1 text-sm bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-4">
        <div className="text-4xl font-semibold leading-none dark:text-gray-100">
          {whole}<span className="text-gray-400 dark:text-gray-500 text-2xl">{fraction}</span>
        </div>
        <div className={`flex items-center gap-1 rounded-lg px-2 py-1 bg-grey-turquoise/50 dark:bg-gray-800 ${pctColor}`}>
          <span className="text-sm font-medium">{noPrior ? "—" : formatPercent(deltaPct!)}</span>
          <Arrow className="w-4 h-4" />
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        {noPrior ? (
          <>No data for {prevPeriodLabel(period)} to compare against</>
        ) : delta >= 0 ? (
          <>
            {invertColor ? "You spent" : "You made"} an extra{" "}
            <span className={invertColor ? "text-loss-red" : "text-turquoise"}>
              {formatCurrency(Math.abs(delta), currency)}
            </span>{" "}
            {periodLabel(period)}
          </>
        ) : (
          <>
            {invertColor ? "You spent" : "You made"}{" "}
            <span className={invertColor ? "text-turquoise" : "text-loss-red"}>
              {formatCurrency(Math.abs(delta), currency)}
            </span>{" "}
            less {periodLabel(period)}
          </>
        )}
      </div>
    </div>
  );
}
