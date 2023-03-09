import express from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { sendEmail } from "../services/sendMail";
import { tokenMiddleware } from "../middleware";
import { forgotPassword, resetPassword } from "../controllers/user";
const privateKey = process.env.PRIVATE_KEY;
const allowRegistration = process.env.ALLOW_REGISTRATION as string;
const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req: express.Request, res: express.Response) => {
    sendEmail("Runing Test", "fidekg123@gmail.com", "Thank you for testing")
      .then((data) => res.status(200).json([{ message: data }]))
      .catch((error) => res.status(200).json([{ message: error }]));
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
router.post(
  "/register",
  asyncHandler(async (req: express.Request, res: express.Response) => {
    if (allowRegistration === "false") {
      res.status(400).json({ errors: "registration is closed" });
    } else {
      const { email, password } = req.body;
      if (password.length < 6) {
        res.status(400).json({ error: "Password must be up to 6 characters" });
      } else {
        const user = await User.createNewUser(email, password);
        res.status(200).json(user);
      }
    }
  })
);

router.post("/forgot-password", tokenMiddleware, forgotPassword);

router.post("/reset-password/:resetToken", resetPassword);
export default router;
