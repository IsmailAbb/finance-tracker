import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/ping", (req, res) => res.json({ msg: "pong" }));

const port = process.env.PORT ?? 5000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));