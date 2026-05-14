import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { HttpError } from "../utils/errors";

function prismaErrorMessage(err: Prisma.PrismaClientKnownRequestError): { status: number; message: string } {
  switch (err.code) {
    case "P2002": {
      const target = (err.meta?.target as string[] | undefined)?.join(", ");
      return { status: 409, message: target ? `A record with that ${target} already exists` : "Duplicate value" };
    }
    case "P2025":
      return { status: 404, message: "Record not found" };
    case "P2003":
      return { status: 400, message: "Foreign key constraint failed" };
    default:
      return { status: 400, message: "Database error" };
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const { status, message } = prismaErrorMessage(err);
    return res.status(status).json({ message });
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res.status(500).json({ message: "Internal server error" });
};
