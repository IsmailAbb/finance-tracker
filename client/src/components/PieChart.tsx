import { useState } from "react";
import {
    PieChart as RePieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const COLORS = ["#0f766e", "#5eead4", "#99f6e4", "#134e4a"];
const MONTHS = ["Jan", "Feb", "March", "April", "May", "June",
                "July", "August", "Sept", "Oct", "Nov", "Dec",
                "Full Year",
] as const;
const YEARS = ["2023", "2024", "2025", "2026"];

const TRANSACTIONTYPE = ["Expenses", "Income", "All"] as const;

type ChartEntry = { name: string; value: number };

type MonthlyData = {[month in typeof MONTHS[number]]: ChartEntry[];};

type TransactionData = {[transaction in typeof TRANSACTIONTYPE[number]]: MonthlyData;};

type YearlyData = {[year in typeof YEARS[number]]: TransactionData;};

export default function PieChart() {
const [month, setMonth] = useState<typeof MONTHS[number]>("Full Year");
const [year, setYear] = useState<typeof YEARS[number]>("2024");
const [transaction, setTransaction] = useState<typeof TRANSACTIONTYPE[number]>("Expenses");
const chartData =  [{ name: 'Apples', value: 400 },
                    { name: 'Bananas', value: 300 },
                    { name: 'Cherries', value: 200 },
                    { name: 'Dates', value: 100 },
                    ];

return (
    <div className="w-full h-full bg-neutral-primary-soft border border-default rounded-base shadow-xs p-4 md:p-6">
      {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <h5 className="text-xl font-semibold text-heading mr-3">
                Summary
            </h5>

        {/* Month Dropdown */}
        <select
            value={month}
            onChange={(e) => setMonth(e.target.value as typeof MONTHS[number])}
            className="text-sm rounded-lg border border-gray-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
            {MONTHS.map((m) => (<option key={m} value={m}>{m}</option>))}
        </select>

        {/* Year Dropdown */}
        <select
            value={year}
            onChange={(e) => setYear(e.target.value as typeof YEARS[number])}
            className="text-sm rounded-lg border border-gray-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
            {YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
        </select>

        {/* Transaction Dropdown */}
        <select
            value={transaction}
            onChange={(e) => setTransaction(e.target.value as typeof TRANSACTIONTYPE[number])}
            className="text-sm rounded-lg border border-gray-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
            {TRANSACTIONTYPE.map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
    </div>

    {/* Chart */}
    <div className="w-full h-[260px]">
        <ResponsiveContainer key={month + year + transaction} width="100%" height="100%">
            <RePieChart>
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={55}
                    paddingAngle={2}
                >
                    {chartData.map((_, index) => (
                    <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                    />
                    ))}
                </Pie>

                <Tooltip
                    formatter={(value: number) => value}
                    contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    }}
                />
            </RePieChart>
        </ResponsiveContainer>
    </div>
    </div>
    );
}
