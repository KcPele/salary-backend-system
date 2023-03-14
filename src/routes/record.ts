import express from "express";
import {
  createRecord,
  getAllRecords,
  getRecord,
  updateRecord,
  deleteRecord,
  getUserRecords,
} from "../controllers/record";
import { tokenMiddleware } from "../middleware";
const router = express.Router();

router.get(
  "/",
  tokenMiddleware,

  getAllRecords
);

router.get(
  "/:recordId",
  tokenMiddleware,

  getRecord
);

router.get("/user/:userId", tokenMiddleware, getUserRecords);

router.post(
  "/",
  tokenMiddleware,

  createRecord
);

router.put(
  "/:recordId",
  tokenMiddleware,

  updateRecord
);

router.delete(
  "/:recordId",
  tokenMiddleware,

  deleteRecord
);

export default router;
