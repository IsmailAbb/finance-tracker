import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { TooltipContentProps } from "recharts/types/component/Tooltip";

export default function GrowthBarChart() {
  const [year, setYear] = useState("2025");
  const [filter, setFilter] = useState("Income");

  const rawData = [
    { name: "Jan", value: 10 },
    { name: "Feb", value: 10 },
    { name: "Mar", value: 10 },
    { name: "Apr", value: 10 },
    { name: "May", value: 10 },
    { name: "June", value: 10 },
    { name: "July", value: 20 },
    { name: "Aug", value: 20 },
    { name: "Sep", value: 20 },
    { name: "Oct", value: 20 },
    { name: "Nov", value: 20 },
    { name: "Dec", value: 20 },
  ];

  const average = rawData.reduce((sum, item) => sum + item.value, 0) / rawData.length;

  const chartData = rawData.map((d) => ({
  ...d,
  cap: 1,
  main: d.value - 1,
}));


  return (
    <div className="bg-white p-6 rounded-xl w-full">
      {/* Top Section */}
      <div className="flex justify-between items-start mb-4">
        {/* Left side text */}
        <div>
          <h2 className="text-3xl font-medium">Year Review</h2>

          <div className="flex items-center gap-4 mt-1">
            <p className="text-5xl font-semibold text-black">
              $2150<span className="text-gray-400">.00</span>
            </p>

            <div className="w-[78px] h-[33px] bg-grey-turquoise rounded-lg flex items-center justify-center gap-1 translate-y-[5px]">
              <span className="text-black text-sm font-medium">+ 3.4%</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="#22c55e"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12l5-5 5 5M5 12h10"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right side dropdowns */}
        <div className="flex gap-2">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none"
          >
            <option value="Filter">Income</option>
            <option>Expenses</option>
            <option>Profit</option>
          </select>
        </div>
      </div>

      {/* Chart */}
{/* Chart */}
<div className="w-full h-[250px]" tabIndex={-1}>
  <ResponsiveContainer key={year + filter} width="100%" height="100%">
    <BarChart
      data={chartData}
      margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
      barCategoryGap="30%"
    >
      <CartesianGrid strokeDasharray="6 6" stroke="#E5E7EB" vertical={false} />
      <XAxis dataKey="name" tick={{ fill: "#6B7280" }} />
      <YAxis axisLine={false} tickLine={false} />
      <Tooltip  cursor={false} 
                content={(props: TooltipContentProps<number, string>) => {
                  const { active, payload, label } = props;
                    if (!active || !payload || payload.length === 0) return null;
                    // Sum up all values from the stacked bars
                    const total = payload.reduce((sum, entry) => sum + (entry.value ?? 0), 0);
                    return (
                      <div className="rounded-md bg-white px-3 py-2 shadow-md text-sm">
                        <p className="font-medium">{label}</p>
                        <p>Total: {total}</p>
                      </div>
                    );
                  }}
      />

      {/* 1px cap bar */}
<Bar
  dataKey="cap"
  stackId="a"
  fill="#0f766e"
  barSize={80}
/>

{/* Main bar */}
<Bar
  dataKey="main"
  stackId="a"
  fill="#70b6a0"
  barSize={80}
  radius={[6, 6, 0, 0]}
/>

    </BarChart>
  </ResponsiveContainer>
</div>
</div>
  );
}