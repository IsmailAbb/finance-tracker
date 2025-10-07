import Router from "express";
import {createTransaction, getTransactions, updateTransaction, deleteTransaction} from "../controllers/transactionController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/", getTransactions);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;