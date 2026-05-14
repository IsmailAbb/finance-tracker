import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler, stripUndefined } from "../utils/asyncHandler";
import { notFound } from "../utils/errors";

const userSelect = {
  id: true,
  email: true,
  name: true,
  currency: true,
  timezone: true,
  weekStartsOn: true,
  createdAt: true,
} as const;

const updateSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254).optional(),
  name: z.string().trim().min(1).max(100).nullable().optional(),
  currency: z.string().trim().length(3).toUpperCase().optional(),
  timezone: z.string().trim().min(1).max(100).optional(),
  weekStartsOn: z.number().int().min(0).max(6).optional(),
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: userSelect,
  });
  if (!user) throw notFound("User not found");
  res.status(200).json(user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const data = updateSchema.parse(req.body);
  const updated = await prisma.user.update({
    where: { id: req.userId! },
    data: stripUndefined(data),
    select: userSelect,
  });
  res.status(200).json(updated);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await prisma.user.delete({ where: { id: req.userId! } });
  res.status(200).json({ message: "User deleted" });
});
