import { useEffect, useState } from "react";
import { api } from "../services/api";
import IncomeExpenseChart from "../components/IncomeExpenseChart";

interface Transaction {
    id: number;
    amount: number;
    date: string;
    description: string;
    category: { name: string; type: string } | null;
}

export default function Dashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/transactions");
                setTransactions(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);
    console.log(transactions);
    return (
    <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Dashboard</h1>
        <IncomeExpenseChart 
            transactions={transactions} 
            options={{
                responsive: true,
                plugins: {
                    legend: { position: "bottom" },
                },
            }}
        />
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-100">
                    <th className="p-2">Date</th>
                    <th className="p-2">Description</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Amount</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map(tx => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="p-2">{tx.description}</td>
                        <td className="p-2">{tx.category?.name || "Uncategorized"}</td>
                        <td className="p-2">{tx.amount}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
}
