import express from "express";
import asyncHandler from "express-async-handler";
import User from "../models/user";
import { permissionMiddleware, tokenMiddleware, upload } from "../middleware";
import {
  changePassword,
  createNewUser,
  deleteUser,
  forgotPassword,
  loginUser,
  resetPassword,
  revokePermission,
  updateUser,
} from "../controllers/user";

const router = express.Router();

//get all users
router.get(
  "/",
  tokenMiddleware,
  permissionMiddleware(["read"]),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const users = await User.find({}).select("-password").sort("-createdAt");
    res.status(200).json(users);
  })
);

//get a particular user
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

// login route to generate user token
router.post("/login", loginUser);
//create a user
router.post(
  "/register",
  tokenMiddleware,
  permissionMiddleware(["create"]),
  upload.single("file"),
  createNewUser
);

//creating admin once.
router.post("/register/chainlor-inmda", upload.single("file"), createNewUser);

// password reset
router.post("/change-password", tokenMiddleware, changePassword);

router.post("/forgot-password", tokenMiddleware, forgotPassword);

router.post("/reset-password/:resetToken", resetPassword);

//update user
router.put(
  "/:userId",
  tokenMiddleware,
  permissionMiddleware(["edit"]),
  upload.single("file"),
  updateUser
);

//revert a user permission
router.delete(
  "/:userId/:permissionId",
  tokenMiddleware,
  permissionMiddleware(["edit"]),
  revokePermission
);

//delete a user
router.delete(
  "/:userId",
  tokenMiddleware,
  permissionMiddleware(["delete"]),
  deleteUser
);
export default router;
