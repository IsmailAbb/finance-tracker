import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../prisma";
import { signToken } from "../utils/jwt";
import { badRequest, conflict, unauthorized } from "../utils/errors";
import { asyncHandler, stripUndefined } from "../utils/asyncHandler";
import { createDefaultCategories, createDefaultAccount } from "../defaultData";

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

const passwordField = z.string().min(8, "Password must be at least 8 characters").max(200);

const registerSchema = z.object({
  email: emailField,
  password: passwordField,
  name: z.string().trim().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1).max(200),
});

function userResponse(u: {
  id: number;
  email: string;
  name: string | null;
  currency: string;
  timezone: string;
  weekStartsOn: number;
}) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    currency: u.currency,
    timezone: u.timezone,
    weekStartsOn: u.weekStartsOn,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = registerSchema.parse(req.body);

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw conflict("Email already registered");

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: stripUndefined({ email, password: hashed, name }) as {
      email: string; password: string; name?: string;
    },
  });

  await createDefaultCategories(user.id);
  await createDefaultAccount(user.id);

  const token = signToken({ userId: user.id });
  res.status(201).json({ token, user: userResponse(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw unauthorized("Incorrect email or password");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw unauthorized("Incorrect email or password");

  const token = signToken({ userId: user.id });
  res.status(200).json({ token, user: userResponse(user) });
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: passwordField,
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { currentPassword, newPassword } = passwordSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw unauthorized();

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw badRequest("Current password is incorrect");

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  res.status(200).json({ message: "Password updated" });
});
