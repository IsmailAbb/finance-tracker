import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler, stripUndefined } from "../utils/asyncHandler";
import { badRequest, notFound } from "../utils/errors";

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  initialBalance: z.number().finite().optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  initialBalance: z.number().finite().optional(),
});

function parseId(raw: string | undefined) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw badRequest("Invalid id");
  return id;
}

async function getAccountWithBalance(id: number, userId: number) {
  const account = await prisma.account.findFirst({
    where: { id, userId },
    include: { transactions: { include: { category: { select: { type: true } } } } },
  });
  if (!account) return null;
  const delta = account.transactions.reduce((sum, t) => {
    const sign = t.category?.type === "expense" ? -1 : 1;
    return sum + sign * t.amount;
  }, 0);
  const { transactions, ...rest } = account;
  return { ...rest, currentBalance: account.initialBalance + delta };
}

async function listAccountsWithBalance(userId: number) {
  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: { transactions: { include: { category: { select: { type: true } } } } },
  });
  return accounts.map((a) => {
    const delta = a.transactions.reduce((sum, t) => {
      const sign = t.category?.type === "expense" ? -1 : 1;
      return sum + sign * t.amount;
    }, 0);
    const { transactions, ...rest } = a;
    return { ...rest, currentBalance: a.initialBalance + delta };
  });
}

export const getAccounts = asyncHandler(async (req: Request, res: Response) => {
  const accounts = await listAccountsWithBalance(req.userId!);
  res.status(200).json(accounts);
});

export const createAccount = asyncHandler(async (req: Request, res: Response) => {
  const { name, initialBalance = 0 } = createSchema.parse(req.body);
  const account = await prisma.account.create({
    data: { name, initialBalance, userId: req.userId! },
  });
  res.status(201).json({ ...account, currentBalance: account.initialBalance });
});

export const updateAccount = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const data = updateSchema.parse(req.body);

  const existing = await prisma.account.findFirst({ where: { id, userId: req.userId! } });
  if (!existing) throw notFound("Account not found");

  await prisma.account.update({ where: { id }, data: stripUndefined(data) });
  const refreshed = await getAccountWithBalance(id, req.userId!);
  res.status(200).json(refreshed);
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  const existing = await prisma.account.findFirst({ where: { id, userId: req.userId! } });
  if (!existing) throw notFound("Account not found");

  await prisma.account.delete({ where: { id } });
  res.status(200).json({ message: "Account deleted" });
});
