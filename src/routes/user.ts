import express from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { grantAccess, tokenMiddleware, upload } from "../middleware";
import {
  createNewUser,
  deleteUser,
  forgotPassword,
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

router.post(
  "/login",
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: "Wrong credentials please try again" });
    } else {
      const comparedPass = await bcrypt.compare(password, user.password);
      if (!comparedPass) {
        res.status(400).json({ error: "Wrong credentials please try again" });
      } else {
        const token = jwt.sign({ _id: user._id }, privateKey as string, {
          expiresIn: 60 * 60 * 48,
        });
        res.status(200).json({ _id: user._id, email: user.email, token });
      }
    }
  })
);
router.post("/register", upload.single("file"), createNewUser);

router.post("/forgot-password", tokenMiddleware, forgotPassword);

router.post("/reset-password/:resetToken", resetPassword);

router.put(
  "/:userId",
  tokenMiddleware,
  grantAccess("updateAny", "profile"),
  upload.single("file"),
  updateUser
);
router.delete(
  "/:userId",
  tokenMiddleware,
  grantAccess("deleteAny", "profile"),
  deleteUser
);
export default router;
