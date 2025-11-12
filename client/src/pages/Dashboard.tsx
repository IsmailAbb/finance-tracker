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
        <IncomeExpenseChart transactions={transactions} />
        <table className="mt-6 border-collapse w-full">
            <thead>
                <tr>
                    <th>Date</th><th>Description</th><th>Category</th><th>Amount</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map(tx => (
                    <tr key={tx.id}>
                        <td>{new Date(tx.date).toLocaleDateString()}</td>
                        <td>{tx.description}</td>
                        <td>{tx.category?.name || "Uncategorized"}</td>
                        <td>{tx.amount}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
}
