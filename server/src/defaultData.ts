import { prisma } from "./prisma";

// Curated palettes — 30 colors each, intentionally distinct hues so users can
// tell categories apart. Kept in sync with client/src/constants/colors.ts.
const EXPENSE_COLORS = [
  "#991b1b", "#9a3412", "#854d0e", "#3f6212", "#166534",
  "#065f46", "#115e59", "#155e75", "#075985", "#1e40af",
  "#4338ca", "#6d28d9", "#86198f", "#9d174d", "#1e293b",
  "#7f1d1d", "#7c2d12", "#713f12", "#365314", "#14532d",
  "#064e3b", "#134e4a", "#164e63", "#0c4a6e", "#1e3a8a",
  "#312e81", "#4c1d95", "#581c87", "#831843", "#422006",
];

const INCOME_COLORS = [
  "#fca5a5", "#fdba74", "#fcd34d", "#fde047", "#bef264",
  "#86efac", "#6ee7b7", "#5eead4", "#67e8f9", "#7dd3fc",
  "#93c5fd", "#a5b4fc", "#c4b5fd", "#f0abfc", "#f9a8d4",
  "#fecaca", "#fed7aa", "#fde68a", "#fef08a", "#d9f99d",
  "#bbf7d0", "#a7f3d0", "#99f6e4", "#a5f3fc", "#bae6fd",
  "#bfdbfe", "#c7d2fe", "#ddd6fe", "#f5d0fe", "#fbcfe8",
];

export async function createDefaultCategories(userId: number) {
  const expenseNames = [
    "Groceries", "Food & Drinks", "Shopping", "Housing", "Transportation",
    "Vehicle", "Entertainment", "Phone", "Debts & Loans", "Other",
  ];
  const incomeNames = ["Salary", "Investments", "Other"];

  const data = [
    ...expenseNames.map((name, i) => ({
      name, type: "expense", userId, color: EXPENSE_COLORS[i % EXPENSE_COLORS.length]!,
    })),
    ...incomeNames.map((name, i) => ({
      name, type: "income", userId, color: INCOME_COLORS[i % INCOME_COLORS.length]!,
    })),
  ];

  await prisma.category.createMany({ data });
}

export async function createDefaultAccount(userId: number) {
  await prisma.account.create({
    data: { name: "Cash", initialBalance: 0, userId },
  });
}
