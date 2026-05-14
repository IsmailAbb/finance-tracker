import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import transactionRoutes from "./routes/transactions";
import categoryRoutes from "./routes/categories";
import userRoutes from "./routes/users";
import accountRoutes from "./routes/accounts";
import { errorHandler } from "./middleware/errorHandler";
import { requireEnv } from "./utils/env";

dotenv.config();

requireEnv("JWT_SECRET");
requireEnv("DATABASE_URL");

const app = express();
const port = Number(process.env.PORT) || 5000;

// Behind Render's proxy: needed for correct client IP in rate limiting + secure cookies.
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  helmet({
    // We're an API; the SPA is on a different origin. Don't apply CSP here.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / curl / mobile (no Origin header) and any whitelisted origin.
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// Limit JSON payloads to 64kb — well above anything legitimate, blocks payload-bomb attacks.
app.use(express.json({ limit: "64kb" }));
app.use(cookieParser());

// Aggressive limits on auth routes to slow brute-force / enumeration attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
});

// Wider limit on everything else: 600 / 15min per IP.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);

app.use(apiLimiter);

app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/categories", categoryRoutes);
app.use("/users", userRoutes);
app.use("/accounts", accountRoutes);

app.use(errorHandler);

app.listen(port, () => console.log(`Server listening on port ${port}`));
