import express from "express";

import { permissionMiddleware, tokenMiddleware } from "../middleware";
import {
  getAllPermission,
  createPermission,
  updatePermission,
  deletePermission,
} from "../controllers/permission";

const router = express.Router();

router.get(
  "/",
  tokenMiddleware,
  permissionMiddleware(["read"]),
  getAllPermission
);
router.post(
  "/",
  tokenMiddleware,
  permissionMiddleware(["create"]),
  createPermission
);
router.put(
  "/:permissionId",
  tokenMiddleware,
  permissionMiddleware(["edit"]),
  updatePermission
);
router.delete(
  "/:permissionId",
  tokenMiddleware,
  permissionMiddleware(["delete"]),
  deletePermission
);
export default router;
