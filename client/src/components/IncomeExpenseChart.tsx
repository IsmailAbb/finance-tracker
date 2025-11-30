import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
    transactions: { amount: number; category: { type: string } | null }[];
    options?: any;
}

export default function IncomeExpenseChart({ transactions, options}: Props) {
    const income = transactions.filter(tx => tx.category?.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
    const expense = transactions.filter(tx => tx.category?.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);
    const data = {
        labels: ["Income", "Expense"],
        datasets: [{
            label: "Amount",
            data: [income, expense],
            backgroundColor: ["#22c55e", "#ef4444"],
        }],
    };
    
    return <Pie data={data} options={options} />;
}
