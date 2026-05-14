import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { unauthorized } from "../utils/errors";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next(unauthorized("Missing authorization header"));

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(unauthorized("Malformed authorization header"));
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    next(unauthorized("Invalid or expired token"));
  }
};
