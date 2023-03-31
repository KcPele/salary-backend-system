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

//get all activities with token and permission
router.get(
  "/",
  tokenMiddleware,
  permissionMiddleware(["read"]),
  getAllActivities
);

//get a particular activity
router.get(
  "/:activityId",
  tokenMiddleware,
  permissionMiddleware(["read"]),
  getActivity
);

//get a user activities
router.get(
  "/user/:userId",
  tokenMiddleware,
  permissionMiddleware(["read"]),
  getUserActivity
);

//create a new activity
// router.post(
//   "/",
//   tokenMiddleware,
//   permissionMiddleware(["create"]),
//   createActivity
// );

//delete activity base on activity id
router.delete(
  "/:activityId",
  tokenMiddleware,
  permissionMiddleware(["delete"]),
  deleteActivity
);

export default router;
