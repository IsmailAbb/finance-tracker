import { useState } from "react";

const MONTHS = ["Jan", "Feb", "March", "April", "May", "June",
                "July", "August", "Sept", "Oct", "Nov", "Dec",
                "Any Month",
    ] as const;

const YEARS = ["2023", "2024", "2025", "2026"];

const TRANSACTIONTYPE = ["Expenses", "Income", "All"] as const;    
    
export default function TransactionsTable() {
    const [month, setMonth] = useState<typeof MONTHS[number]>("Any Month");
    const [year, setYear] = useState<typeof YEARS[number]>("2024");
    const [transaction, setTransaction] = useState<typeof TRANSACTIONTYPE[number]>("Expenses");
    return (
        <div className="w-full h-full">
            <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center gap-4 p-4">
  {/* Title */}
  <div className="text-lg font-medium">
    Recent Transactions
  </div>

  {/* Right-side actions */}
  <div className="flex items-center gap-2 ml-auto">
    <select
      value={month}
      onChange={(e) => setMonth(e.target.value as typeof MONTHS[number])}
      className="text-sm rounded-lg border border-gray-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {MONTHS.map((m) => (
        <option key={m} value={m}>{m}</option>
      ))}
    </select>

    <select
      value={year}
      onChange={(e) => setYear(e.target.value as typeof YEARS[number])}
      className="text-sm rounded-lg border border-gray-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {YEARS.map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>

    <select
      value={transaction}
      onChange={(e) => setTransaction(e.target.value as typeof TRANSACTIONTYPE[number])}
      className="text-sm rounded-lg border border-gray-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {TRANSACTIONTYPE.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>

    <button className="flex items-center text-white bg-primary-700 hover:bg-primary-800 font-medium rounded-lg text-sm px-4 py-2">
      Add Transaction
    </button>
  </div>
</div>


            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                    <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b dark:border-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        Food
                    </td>
                    <td className="px-4 py-3">20 $</td>
                    <td className="px-4 py-3">19/12/20025</td>
                    <td className="px-4 py-3">Expense</td>
                    <td className="px-4 py-3">Went to a pepenero with friends</td>
                    </tr>
                </tbody>
                </table>
            </div>

            </div>
        </div>
    );
}
