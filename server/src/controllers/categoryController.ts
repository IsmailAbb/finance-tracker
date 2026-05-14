import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler, stripUndefined } from "../utils/asyncHandler";
import { badRequest, conflict, notFound } from "../utils/errors";

const typeEnum = z.enum(["income", "expense"]);
const colorHex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex string like #aabbcc");

const createSchema = z.object({
  name: z.string().trim().min(1).max(50),
  type: typeEnum,
  color: colorHex.nullable().optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  type: typeEnum.optional(),
  color: colorHex.nullable().optional(),
});

function parseId(raw: string | undefined) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw badRequest("Invalid id");
  return id;
}

/** True if another category of the same user+type already uses this color. */
async function colorTaken(userId: number, type: string, color: string, excludeId?: number) {
  const existing = await prisma.category.findFirst({
    where: { userId, type, color, ...(excludeId !== undefined && { NOT: { id: excludeId } }) },
    select: { id: true },
  });
  return !!existing;
}

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.userId! },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  res.status(200).json(categories);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const data = createSchema.parse(req.body);
  if (data.color && (await colorTaken(req.userId!, data.type, data.color))) {
    throw conflict("That color is already used by another category");
  }
  const category = await prisma.category.create({
    data: stripUndefined({ ...data, userId: req.userId! }) as { name: string; type: "income" | "expense"; userId: number; color?: string | null },
  });
  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const data = updateSchema.parse(req.body);

  const existing = await prisma.category.findFirst({ where: { id, userId: req.userId! } });
  if (!existing) throw notFound("Category not found");

  // If changing color, ensure no other category of the resulting type uses it.
  const nextType = data.type ?? existing.type;
  if (data.color && (await colorTaken(req.userId!, nextType, data.color, id))) {
    throw conflict("That color is already used by another category");
  }

  const updated = await prisma.category.update({ where: { id }, data: stripUndefined(data) });
  res.status(200).json(updated);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const existing = await prisma.category.findFirst({ where: { id, userId: req.userId! } });
  if (!existing) throw notFound("Category not found");
  await prisma.category.delete({ where: { id } });
  res.status(200).json({ message: "Category deleted" });
});
