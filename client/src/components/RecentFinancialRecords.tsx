import { useState } from "react";

const MONTHS = ["Jan", "Feb", "March", "April", "May", "June",
                "July", "August", "Sept", "Oct", "Nov", "Dec",
                "Any Month",
    ] as const;

export default function TransactionsTable() {
    const [month, setMonth] = useState<typeof MONTHS[number]>("Any Month");
    return (
        <div className="w-full h-full">
            <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
                <div className = "text-lg font-medium">Recent Transactions</div>

                {/* Actions */}
                <div className="flex gap-2">
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
                    </tr>
                </tbody>
                </table>
            </div>

            </div>
        </div>
    );
}
