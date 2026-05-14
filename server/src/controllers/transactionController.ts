import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { badRequest, notFound } from "../utils/errors";

const money = z
  .number()
  .positive("Amount must be positive")
  .refine(
    (v) => Math.round(v * 100) === v * 100,
    "Amount can have at most 2 decimal places"
  );

const baseSchema = z.object({
  amount: money,
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
  description: z.string().trim().max(500).nullable().optional(),
  accountId: z.number().int().positive(),
  categoryId: z.number().int().positive().nullable().optional(),
});

const updateSchema = baseSchema.partial();

function parseId(raw: string | undefined) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw badRequest("Invalid id");
  return id;
}

async function assertOwnsAccount(accountId: number, userId: number) {
  const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!account) throw badRequest("Account does not belong to user");
}

async function assertOwnsCategory(categoryId: number, userId: number) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw badRequest("Category does not belong to user");
}

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId! },
    include: {
      account: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, type: true } },
    },
    orderBy: { date: "desc" },
  });
  res.status(200).json(transactions);
});

export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const data = baseSchema.parse(req.body);
  const userId = req.userId!;

  await assertOwnsAccount(data.accountId, userId);
  if (data.categoryId) await assertOwnsCategory(data.categoryId, userId);

  const transaction = await prisma.transaction.create({
    data: {
      amount: data.amount,
      date: new Date(data.date),
      description: data.description ?? null,
      accountId: data.accountId,
      categoryId: data.categoryId ?? null,
      userId,
    },
    include: {
      account: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, type: true } },
    },
  });
  res.status(201).json(transaction);
});

export const updateTransaction = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const data = updateSchema.parse(req.body);
  const userId = req.userId!;

  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw notFound("Transaction not found");

  if (data.accountId) await assertOwnsAccount(data.accountId, userId);
  if (data.categoryId) await assertOwnsCategory(data.categoryId, userId);

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.accountId !== undefined && { accountId: data.accountId }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
    },
    include: {
      account: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, type: true } },
    },
  });
  res.status(200).json(updated);
});

export const deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const userId = req.userId!;

  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw notFound("Transaction not found");

  await prisma.transaction.delete({ where: { id } });
  res.status(200).json({ message: "Transaction deleted" });
});
