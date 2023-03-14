import express from "express";

import { tokenMiddleware } from "../middleware";
import {
  getAllPermission,
  createPermission,
  updatePermission,
  deletePermission,
} from "../controllers/permission";

const router = express.Router();

router.get("/", tokenMiddleware, getAllPermission);
router.post("/", tokenMiddleware, createPermission);
router.put("/:permissionId", tokenMiddleware, updatePermission);
router.delete("/:permissionId", tokenMiddleware, deletePermission);
export default router;
