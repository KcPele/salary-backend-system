import express from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { permissionMiddleware, tokenMiddleware, upload } from "../middleware";
import {
  createNewUser,
  deleteUser,
  forgotPassword,
  loginUser,
  resetPassword,
  updateUser,
} from "../controllers/user";
const privateKey = process.env.PRIVATE_KEY;
const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  })
);

router.get(
  "/:userId",
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { userId } = req.params;
    const users = await User.findById(userId)
      .populate("permission")
      .select("-password");
    res.status(200).json(users);
  })
);

router.post("/login", loginUser);
router.post(
  "/register",
  tokenMiddleware,
  permissionMiddleware(["create"]),
  upload.single("file"),
  createNewUser
);
router.post("/register/lorchain-admin", upload.single("file"), createNewUser);

router.post("/forgot-password", tokenMiddleware, forgotPassword);

router.post("/reset-password/:resetToken", resetPassword);

router.put(
  "/:userId",
  tokenMiddleware,
  permissionMiddleware(["edit"]),
  upload.single("file"),
  updateUser
);
router.delete(
  "/:userId",
  tokenMiddleware,
  permissionMiddleware(["edit"]),
  deleteUser
);
export default router;
