import express from "express";
import {
  createRecord,
  getAllRecords,
  getRecord,
  updateRecord,
  deleteRecord,
} from "../controllers/record";
import { tokenMiddleware } from "../middleware";
import { grantAccess } from "../middleware";
const router = express.Router();

router.get(
  "/",
  tokenMiddleware,
  grantAccess("readAny", "record"),
  getAllRecords
);

router.get(
  "/:recordId",
  tokenMiddleware,
  grantAccess("readOwn", "record"),
  getRecord
);

router.post(
  "/",
  tokenMiddleware,
  grantAccess("createAny", "record"),
  createRecord
);

router.put(
  "/:recordId",
  tokenMiddleware,
  grantAccess("updateAny", "record"),
  updateRecord
);

router.delete(
  "/:recordId",
  tokenMiddleware,
  grantAccess("deleteAny", "record"),
  deleteRecord
);

export default router;
