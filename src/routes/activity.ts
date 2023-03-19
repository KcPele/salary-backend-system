import express from "express";

import { permissionMiddleware, tokenMiddleware } from "../middleware";
import {
  createActivity,
  getAllActivities,
  getUserActivity,
  getActivity,
  deleteActivity,
} from "../controllers/activity";
const router = express.Router();

router.get(
  "/",
  tokenMiddleware,
  permissionMiddleware(["read"]),
  getAllActivities
);
router.get(
  "/:activityId",
  tokenMiddleware,
  permissionMiddleware(["read"]),
  getActivity
);
router.get(
  "/user/:userId",
  tokenMiddleware,
  permissionMiddleware(["read"]),
  getUserActivity
);
router.post(
  "/",
  tokenMiddleware,
  permissionMiddleware(["create"]),
  createActivity
);
router.delete(
  "/:activityId",
  tokenMiddleware,
  permissionMiddleware(["delete"]),
  deleteActivity
);

export default router;
