import { Router } from "express";
import { getUser, updateUser, deleteUser } from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/me", getUser);
router.patch("/me", updateUser);
router.delete("/me", deleteUser);

export default router;
