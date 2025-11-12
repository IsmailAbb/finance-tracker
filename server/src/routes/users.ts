import Router from "express";
import {getUser, updateUser, deleteUser} from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;