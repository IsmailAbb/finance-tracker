import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import transactionRouter from "../routes/transactions.js";
import userRouter from "../routes/users.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/transactions" ,transactionRouter);
app.use("/users" ,userRouter);

app.get("/", (req, res) => res.json({ msg: "Test" }));

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));