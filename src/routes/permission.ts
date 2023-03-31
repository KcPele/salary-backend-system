import express from "express";

import { permissionMiddleware, tokenMiddleware } from "../middleware";
import {
  getAllPermission,
  createPermission,
  updatePermission,
  deletePermission,
} from "../controllers/permission";

const router = express.Router();

//get all permissions
router.get(
  "/",
  tokenMiddleware,
  permissionMiddleware(["read"]),
  getAllPermission
);

//create a new permission
router.post(
  "/",
  tokenMiddleware,
  permissionMiddleware(["create"]),
  createPermission
);

//update permission base on permission id
router.put(
  "/:permissionId",
  tokenMiddleware,
  permissionMiddleware(["edit"]),
  updatePermission
);

//delete permission base on permission id
router.delete(
  "/:permissionId",
  tokenMiddleware,
  permissionMiddleware(["delete"]),
  deletePermission
);
export default router;
