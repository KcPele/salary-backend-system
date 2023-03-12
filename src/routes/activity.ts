import express from "express";

import { tokenMiddleware } from "../middleware";
import {
  createActivity,
  getAllActivities,
  getUserActivity,
  getActivity,
  deleteActivity,
} from "../controllers/activity";
const router = express.Router();

router.get("/", tokenMiddleware, getAllActivities);
router.get("/:activityId", tokenMiddleware, getActivity);
router.get("/user/:userId", tokenMiddleware, getUserActivity);
router.post("/", tokenMiddleware, createActivity);
router.delete("/:activityId", tokenMiddleware, deleteActivity);

export default router;
