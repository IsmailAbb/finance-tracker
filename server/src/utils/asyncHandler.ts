import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncFn): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

type NonUndefined<T> = { [K in keyof T]: Exclude<T[K], undefined> };

/** Removes keys whose value is `undefined`. Needed for Prisma + exactOptionalPropertyTypes. */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<NonUndefined<T>> {
  const out: Record<string, unknown> = {};
  for (const k in obj) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out as Partial<NonUndefined<T>>;
}
