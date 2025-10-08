import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import transactionRoutes from "./routes/transactions";
import categoryRoutes from "./routes/categories";
import userRoutes from "./routes/users";
import accountRoutes from "./routes/accounts";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/categories", categoryRoutes);
app.use("/users", userRoutes);
app.use("/accounts", accountRoutes);

app.get("/", (req, res) => res.json({ msg: "Test" }));

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));