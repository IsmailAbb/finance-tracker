import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function createDefaultCategories(userId: number) {
  const defaults = [
    { name: "Groceries", type: "expense", userId },
    { name: "Food & Drinks", type: "expense", userId },
    { name: "Shopping", type: "expense", userId },
    { name: "Housing", type: "expense", userId },
    { name: "Transportation", type: "expense", userId },
    { name: "Vehicle", type: "expense", userId },
    { name: "Entertainment", type: "expense", userId },
    { name: "Phone", type: "expense", userId },
    { name: "Debts & Loans", type: "expense", userId },
    { name: "Other", type: "expense", userId },
    { name: "Income", type: "income", userId },
    { name: "Investments", type: "income", userId },
    { name: "Other", type: "income", userId },
  ];

  await prisma.category.createMany({ data: defaults });
}

async function createDefaultAccount(userId: number) {
  await prisma.account.create({
    data: {
      name: "Cash",
      balance: 0,
      userId,
    },
  });
}
export { createDefaultCategories, createDefaultAccount };