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

//get all records
router.get("/", tokenMiddleware, permissionMiddleware(["read"]), getAllRecords);

//get a particular record
router.get("/:recordId", tokenMiddleware, getRecord);

//get a user reocords
router.get("/user/:userId", tokenMiddleware, getUserRecords);

//create a new record
router.post(
  "/",
  tokenMiddleware,
  permissionMiddleware(["create"]),
  createRecord
);

//update record base on reord id
router.put(
  "/:recordId",
  tokenMiddleware,
  permissionMiddleware(["edit"]),
  updateRecord
);

//delete a record
router.delete(
  "/:recordId",
  tokenMiddleware,
  permissionMiddleware(["delete"]),
  deleteRecord
);

export default router;
