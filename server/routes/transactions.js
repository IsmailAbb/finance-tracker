import express from "express";
import pool from "../src/db.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET all transactions
router.get("/", async (req, res) => {
  try{
    const transactions = await prisma.transaction.findMany();
    res.json(transactions);
  }
  catch(err){
    console.error(err.message);
    res.status(500).json({error: "Server Error"});
  }
});

// POST new transaction
router.post("/", async (req, res) => {
  try{
    const {userId, amount, category, description} = req.body;
    if (!userId || !amount || !category || !description) {
      return res.status(400).json({ error: "Missing info" });
    }
    const transaction = await prisma.transaction.create({
      data:{
        userId,
        amount,
        category,
        description,
      },
    });
  res.json(transaction);
}
  catch(err){
    console.error(err.message);
    res.status(500).json({error:"failed to create transaction"});
  }
});

export default router;
