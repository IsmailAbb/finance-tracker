import { useEffect, useState, useRef } from "react";
import { api } from "../services/api";
import BarChart from "../components/BarChart";
import PieChart from "../components/PieChart";
import RecentFinancialRecords from "../components/RecentFinancialRecords";
import AllFinancialRecords from "../components/AllFinancialRecords";
interface Transaction {
    id: number;
    amount: number;
    date: string;
    description: string;
    category: { name: string; type: string } | null;
}

export default function Dashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [activeTab, setActiveTab] = useState("Overview");
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
    
    const tabs = ["Overview", "Transactions", "Settings"];
    const tabRefs = useRef<Array<HTMLButtonElement | null>>(Array(tabs.length).fill(null));

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

    useEffect(() => {
        const index = tabs.indexOf(activeTab);
        const tabEl = tabRefs.current[index];
        if (tabEl) {
        setUnderlineStyle({
            left: tabEl.offsetLeft,
            width: tabEl.offsetWidth,
        });
        }
    }, [activeTab, tabs]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
        {/* ---------- TOP BAR ---------- */}
        <header className="w-full mb-8">
            {/* Header content */}
            <div className="flex items-center justify-end gap-3 px-4 py-2 rounded-xl">
            <img
                src="../images/profile-icon.webp"
                className="w-10 h-10 rounded-full"
                alt="avatar"
            />
            <div className="flex flex-col leading-tight">
                <span className="font-medium">Ismail Abbas</span>
                <span className="text-sm">ismailahmabb@gmail.com</span>
            </div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
            </svg>
            </div>

            {/* Bottom line */}
            <div className="w-full border-b mt-2"></div>
        </header>

        {/* ---------- NAV TABS ---------- */}
        <div className="flex justify-between items-start mb-8">
            <h1 className="text-3xl font-semibold">Finance Report</h1>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-transparent">
                {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 text-lg font-medium transition-all duration-300
                    ${
                        activeTab === tab
                        ? "text-vivid-turquoise border-b-2 border-vivid-turquoise"
                        : "text-black border-b-2 border-transparent hover:text-vivid-turquoise"
                    }
                    `}
                >
                    {tab}
                </button>
                ))}
            </div>
        </div>

        {/* ---------- OVERVIEW TAB ---------- */}
        {activeTab === "Overview" && (
            <>
                {/* ---------- STATS CARDS ---------- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* CARD 1 */}
                    <div className="bg-white p-6 rounded-2xl shadow h-[204px] flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                        <div className="text-lg font-medium">My Balance</div>
                        <select className="border rounded-lg px-2 py-1 text-sm bg-white">
                            <option>Day</option>
                            <option>Week</option>
                            <option>Month</option>
                            <option>Year</option>
                        </select>
                        </div>

                        <div className="flex items-center gap-5">
                        <div className="text-5xl font-semibold translate-y-[-15px]">
                            $15,784<span className="text-gray-400">.23</span>
                        </div>

                        <div className="w-[78px] h-[33px] bg-grey-turquoise rounded-lg flex items-center justify-center gap-1 translate-y-[-10px]">
                            <span className="text-black text-sm font-medium">+ 3.4%</span>
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="#22c55e"
                            className="w-4 h-4"
                            >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5-5 5 5M5 12h10" />
                            </svg>
                        </div>
                        </div>

                        <div className="text-sm mb-2 translate-y-[-35px]">
                        You made an extra <span className="text-turquoise">$524</span> this month
                        </div>
                    </div>


                    {/* CARD 2 — content can be changed */}
                    <div className="bg-white p-6 rounded-2xl shadow h-[204px] flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                                >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                                />
                            </svg>
                            <div className="text-lg font-medium">Income</div>
                        </div>
                        <select className="border rounded-lg px-2 py-1 text-sm bg-white">
                            <option>Day</option>
                            <option>Week</option>
                            <option>Month</option>
                            <option>Year</option>
                        </select>
                        </div>

                        <div className="flex items-center gap-5">
                        <div className="text-5xl font-semibold">
                            $15,784<span className="text-gray-400">.23</span>
                        </div>

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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5-5 5 5M5 12h10" />
                            </svg>
                        </div>
                        </div>

                        <div className="text-sm mb-2 translate-y-[-5px]">
                        You made an extra <span className="text-turquoise">$524</span> this month
                        </div>

                        {/* Bottom button */}
                            <button className="flex items-center justify-center gap-1 text-sm font-medium text-black mt-2">
                                <span>See details</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                    </div>


                    {/* CARD 3 — content can be changed */}
                    <div className="bg-white p-6 rounded-2xl shadow h-[204px] flex flex-col justify-between">
                        {/* Top row: icon, title, selector */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth={1.5} 
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                                />
                            </svg>
                            <div className="text-lg font-medium">Expenses</div>
                            </div>

                            <select className="border rounded-lg px-2 py-1 text-sm bg-white">
                            <option>Day</option>
                            <option>Week</option>
                            <option>Month</option>
                            <option>Year</option>
                            </select>
                        </div>

                        {/* Balance + percentage */}
                        <div className="flex items-center gap-5">
                            <div className="text-5xl font-semibold">
                            $15,784<span className="text-gray-400">.23</span>
                            </div>

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
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5-5 5 5M5 12h10" />
                            </svg>
                            </div>
                        </div>

                        <div className="text-sm mb-2 translate-y-[-5px]">
                            You spent an extra <span className="text-loss-red">$524</span> this month
                        </div>
                        {/* Bottom button */}
                            <button className="flex items-center justify-center gap-1 text-sm font-medium text-black mt-2">
                                <span>See details</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                    </div>
                </div>

                {/* ---------- CUSTOM 12-BAR REAL CHART ---------- */}
                <div className="bg-white p-4 rounded-xl shadow relative">
                    <BarChart />
                </div>

                <div className="bg-white p-4 rounded-xl shadow mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ---------- Pie Chart ---------- */}
                    <div className="lg:col-span-1">
                        <PieChart />
                    </div>
                {/* ---------- Transactions ---------- */}
                    <div className="lg:col-span-2">
                        <RecentFinancialRecords />
                    </div>
                </div>
            </>
        )}

        {activeTab === "Transactions" && (
            <div className="bg-white p-6 rounded-xl shadow">
                <AllFinancialRecords />
            </div>
        )}

        {activeTab === "Settings" && (
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-2xl font-semibold mb-4">Settings</h2>
                <p className="text-gray-600">Settings content goes here.</p>
            </div>
        )}
        </div>
    );
    }