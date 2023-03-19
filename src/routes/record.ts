import express from "express";
import {
  createRecord,
  getAllRecords,
  getRecord,
  updateRecord,
  deleteRecord,
  getUserRecords,
} from "../controllers/record";
import { permissionMiddleware, tokenMiddleware } from "../middleware";
const router = express.Router();

router.get("/", tokenMiddleware, permissionMiddleware(["read"]), getAllRecords);

router.get(
  "/:recordId",
  tokenMiddleware,
  getRecord
);

router.get(
  "/user/:userId",
  tokenMiddleware,
  getUserRecords
);

router.post(
  "/",
  tokenMiddleware,
  permissionMiddleware(["create"]),
  createRecord
);

router.put(
  "/:recordId",
  tokenMiddleware,
  permissionMiddleware(["edit"]),
  updateRecord
);

router.delete(
  "/:recordId",
  tokenMiddleware,
  permissionMiddleware(["delete"]),
  deleteRecord
);

export default router;
